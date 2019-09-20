#include <cosiolib/contract.hpp>
#include <cosiolib/print.hpp>
#include <cosiolib/system.hpp>

using namespace std;

// enum arena_state {
//     WAIT_CHANLLENGER,
//     DUELING,
//     FINISHED,
// };

/**
 * @brief record type of "arena" table.
 */
struct arena {
    cosio::name creator;
    cosio::name challenger;
    cosio::name middleman;
    uint64_t stake;
    uint64_t state;

    // specify the sequence of fields for serialization.
    COSIO_SERIALIZE(arena, (creator)(challenger)(middleman)(stake)(state))
};

/**
 * @brief the duel contract class
 */
struct duel : public cosio::contract {
    using cosio::contract::contract;

    /**
     * @brief setup an arena.
     *
     * @param stake         the amount COS the player stakes.
     * @param middleman     someone players can trust, usually a game operator
     */
    void set_arena(string middleman) {
        auto creator = get_caller().account();
        arenas.insert([&](arena& a){
            a.creator.set_string(creator);
            a.middleman.set_string(middleman);
            a.stake = cosio::get_contract_sender_value();
            a.state = 0;
        });

        cosio::print_f("user % has setup an arena, staked % COS. \n", creator, cosio::get_contract_sender_value());
    }

    /**
     * @brief join an existed arena, player who joined the
     *        arena will also need to stake the same amount
     *        of COS as the creator.
     *
     * @param creator     the account who created this arena.
     * @param middleman   see set_arena
     */
    void join_arena(string creator, string middleman) {
        auto challenger = get_caller().account();
        auto stake = cosio::get_contract_sender_value();

        auto a = arenas.get(creator);
        cosio::cosio_assert(arenas.has(creator), std::string("no arena for: ") + creator);
        cosio::cosio_assert(stake == a.stake, std::string("stake mismatch"));
        cosio::cosio_assert(middleman == a.middleman.account(), std::string("middleman mismatch"));
        cosio::cosio_assert(0 == a.state, std::string("invalid arena state of"));

        arenas.update(creator, [&](arena& a){
                    a.challenger.set_string(challenger);
                    a.state = 1;
                    });
    }

    /**
     * @brief join an existed arena, player who joined the
     *        arena will also need to stake the same amount
     *        of COS as the creator.
     *
     * @param creator     the account who created this arena.
     * @param middleman   see set_arena
     */
    void winner(string creator, string w) {
        auto middleman = get_caller().account();
        cosio::require_auth(middleman);

        auto total_stake = arenas.get(creator).stake * 2;
        cosio::transfer_to_user(w, total_stake, "duel winner of arena: " + creator);
        arenas.remove(creator);
        cosio::print_f("user % is the winner in duel created by %, won % COS. \n", w, creator, total_stake);
    }

    COSIO_DEFINE_TABLE( arenas, arena, (creator) );
};

// declare the class and methods of contract.
COSIO_ABI(duel, (set_arena)(join_arena)(winner))
