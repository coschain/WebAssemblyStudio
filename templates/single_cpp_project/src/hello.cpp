#include <cosiolib/contract.hpp>
#include <cosiolib/print.hpp>
#include "header.hpp"

// the database table record type
struct checkin {
    cosio::name name;
    uint64_t count;

    // record type must support serialization.
    COSIO_SERIALIZE(checkin, (name)(count))
};

// the database table record type
struct post {
    cosio::name name;
    uint64_t count;

    // record type must support serialization.
    COSIO_SERIALIZE(post, (name)(count))
};

// the database table record type
struct comment {
    uint64_t id;
    cosio::name name;
    std::string content;

    // record type must support serialization.
    COSIO_SERIALIZE(comment, (id)(name)(content) )
};

// the contract class
class registercount : public cosio::contract {
public:
    using cosio::contract::contract;

    void checkincount( std::string user_str ) {
      cosio::name user(user_str);

        if(!table_checkin.has(user)) {
          table_checkin.insert([&](checkin& r){
            r.name = user;
            r.count = 1;
          });
        } else {
          table_checkin.update(user, [&](checkin& r){
            r.count++;
          });
        }

        auto r = table_checkin.get(user);
        cosio::print_f("Hello %, we have met % times.", user, r.count);
    }

    void postcount( std::string user_str, uint64_t random ) {
      cosio::name user(user_str);

        if(!table_post.has(user)) {
          table_post.insert([&](post& r){
            r.name = user;
            r.count = 1;
          });
        } else {
          table_post.update(user, [&](post& r){
            r.count++;
          });
        }

        auto r = table_post.get(user);
        cosio::print_f("Hello %, we have met % times.", user, r.count);
    }

    void commentcount( uint64_t id, std::string name, std::string content, uint64_t random ) {
      if(!table_comment.has(id)) {
        table_comment.insert([&](comment& r){
          r.id = id;
          r.name = name;
          r.content = content;
        });

        auto r = table_comment.get(id);
        cosio::print_f("Comment id: %, comment executor: %, content: %.", r.id, r.name, r.content);
      } else {
        cosio::cosio_assert(false, "Comment id has already exist.");
      }
    }
private:

    COSIO_DEFINE_TABLE( table_checkin, checkin, (name)(count) );

    COSIO_DEFINE_TABLE( table_post, post, (name)(count) );

    COSIO_DEFINE_TABLE( table_comment, comment, (id)(name)(content) );
};

COSIO_ABI(registercount, (checkincount)(postcount)(commentcount) )
