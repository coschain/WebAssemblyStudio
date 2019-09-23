#include <cosiolib/contract.hpp>
#include <cosiolib/print.hpp>
#include <cosiolib/system.hpp>

using namespace std;

/**
 * @brief record type of "arena" table.
 */
struct arena {
    cosio::name creator;       
    cosio::checksum256 arena_id_hash;
    cosio::name challenger; 
    cosio::name referee;        
    uint64_t stake;    
    uint64_t state;         

    // specify the sequence of fields for serialization.
    COSIO_SERIALIZE(arena, (creator)(arena_id_hash)(challenger)(referee)(stake)(state))
};

/**
 * @brief the duel contract class
 */
struct duel : public cosio::contract {
    using cosio::contract::contract;
    const int hash_len = 32;

    /**
     * @brief setup an arena.
     * 
     * @param stake         the amount COS the player stakes.
     * @param referee       someone players can trust, usually a game operator
     */
    void open_arena(string referee, cosio::checksum256 arena_id_hash) {
        auto creator = get_caller().account();
        if (arenas.has(creator)) {
            cosio::cosio_assert(arenas.get(creator).state == 0, "arena is occupied");
            arenas.update(creator, [&](arena& a) {
                auto extra = cosio::get_contract_sender_value();
                memcpy(a.arena_id_hash.hash, arena_id_hash.hash, hash_len);
                a.referee.set_string(referee);
                a.stake += extra;
                cosio::print_f("creator % has put extra % uCOS on stake, staked % uCOS in total. \n", creator, extra, a.stake);
            });
            return;
        };

        arenas.insert([&](arena& a){
            a.creator.set_string(creator);
            memcpy(a.arena_id_hash.hash, arena_id_hash.hash, hash_len);
            a.referee.set_string(referee);
            a.stake = cosio::get_contract_sender_value();
            a.state = 0;
        });
        

        cosio::print_f("user % has opened an arena, staked % uCOS. \n", creator, cosio::get_contract_sender_value());
    }

    /**
     * @brief join an existed arena, player who joined the
     *        arena will also need to stake the same amount
     *        of COS as the creator.
     * 
     * @param creator     the account who created this arena.
     * @param referee     see open_arena 
     * @param arena_id    it should be maintained by game client, to prevent
     *                    users from joining an arena of a different game
     */
    void join_arena(string creator, string referee, string arena_id) {
        auto challenger = get_caller().account();
        auto stake = cosio::get_contract_sender_value();

        auto a = arenas.get(creator);
        cosio::cosio_assert(arenas.has(creator), "arena not found, creator: " + creator);
        cosio::cosio_assert(stake == a.stake, std::string("stake mismatch"));
        cosio::cosio_assert(referee == a.referee.account(), std::string("referee mismatch"));
        cosio::cosio_assert(0 == a.state, std::string("invalid arena state, duel is in process"));
        cosio::cosio_assert(checksum_equal(a.arena_id_hash, get_id_hash(arena_id)), std::string("invalid arena id"));

        arenas.update(creator, [&](arena& a){
            a.challenger.set_string(challenger);
            a.state = 1;
        });
        cosio::print_f("user % has challenged % in arena, staked % uCOS \n", challenger, creator, cosio::get_contract_sender_value());
    }

    cosio::checksum256 get_id_hash(string id) {
        cosio::bytes buf;
        buf.insert(buf.begin(), id.begin(), id.end());
        return cosio::sha256(buf);
    }

    bool checksum_equal(const cosio::checksum256 &c1, const cosio::checksum256 &c2) {
        for(int i=0; i<32; ++i)
            if (c1.hash[i] != c2.hash[i]) return false;
        
        return true;
    }

    /**
     * @brief join an existed arena, player who joined the 
     *        arena will also need to stake the same amount
     *        of COS as the creator.
     * 
     * @param creator     the account who created this arena.
     * @param referee   see open_arena 
     */
    void close_arena(string creator, string winner) {
        cosio::cosio_assert(arenas.has(creator), "arena not found, creator: " + creator);
        auto arena = arenas.get(creator);
        cosio::require_auth(arena.referee);
        cosio::cosio_assert(winner == arena.creator.string() || winner == arena.challenger.string(), 
            "invalid winner: " + winner + " of arena created by " + creator + ", challenger: " + arena.challenger.string());

        auto total_stake = arena.stake * 2;
        cosio::transfer_to_user(winner, total_stake, "duel winner of arena: " + creator);
        arenas.remove(creator);
        cosio::print_f("user % is the winner in duel created by %, won % uCOS. \n", winner, creator, total_stake);
    }

    COSIO_DEFINE_TABLE( arenas, arena, (creator) );
};

// declare the class and methods of contract.
COSIO_ABI(duel, (open_arena)(join_arena)(close_arena))
