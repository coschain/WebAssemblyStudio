#include <cosiolib/contract.hpp>
#include <cosiolib/print.hpp>
#include "i18n.hpp"

// the contract class
class hello_i18n : public cosio::contract {
public:
    // all contract classes MUST have same constructor prototype
    using cosio::contract::contract;

    // contract method: greet
    void greet(const std::string& lang) {
      // say hello to contract caller, in specified language.
      cosio::print_f("% %\n", i18n.hello(lang), get_caller());
    }
private:
	registered_i18n i18n;
};

// declare the class and methods of contract
COSIO_ABI(hello_i18n, (greet))
