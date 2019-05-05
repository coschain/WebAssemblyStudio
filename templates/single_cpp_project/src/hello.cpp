#include <cosiolib/contract.hpp>
#include <cosiolib/print.hpp>

// the contract class
class hello : public cosio::contract {
public:
    // all contract classes MUST have same constructor prototype
    using cosio::contract::contract;

    // contract method: greet
    void greet() {
      // say hello to contract caller
      cosio::print_f("Hello %\n", get_caller());
    }
};

// declare the class and methods of contract
COSIO_ABI(hello, (greet))
