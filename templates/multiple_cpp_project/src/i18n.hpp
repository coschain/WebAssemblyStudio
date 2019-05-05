#pragma once

#include <string>
#include <map>

class registered_i18n {
public:
	registered_i18n() {
		m_map["chinese"] = "你好";
		m_map["russian"] = "привет";
		m_map["japanese"] = "こんにちは";
		m_map["spanish"] = "hola";	
	}

	std::string hello(const std::string& lang) {
		auto it = m_map.find(lang);
		if (it == m_map.end()) {
			return "hello";
		}
		return it->second;
	}

private:
	std::map<std::string, std::string> m_map;
};
