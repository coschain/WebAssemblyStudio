#pragma once

#include <string>
#include <map>

class registered_i18n {
public:
	registered_i18n();
	std::string hello(const std::string& lang);

private:
	std::map<std::string, std::string> m_map;
};
