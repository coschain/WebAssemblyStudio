#include "i18n.hpp"

registered_i18n::registered_i18n() {
	m_map["chinese"] = "你好";
	m_map["russian"] = "привет";
	m_map["japanese"] = "こんにちは";
	m_map["spanish"] = "hola";	
}

std::string registered_i18n::hello(const std::string& lang) {
	auto it = m_map.find(lang);
	if (it == m_map.end()) {
		return "hello";
	}
	return it->second;
}

