#include <eosiolib/eosio.hpp>

using namespace eosio;

int call(int a,int b){
	return a+b;
}

CONTRACT hello : public eosio::contract {
  public:
      using contract::contract;

      ACTION hi( name user );

      // accessor for external contracts to easily send inline actions to your contract
};
