#include <iostream>
#include <filesystem>
using namespace std;
int main()
{
    cout<<"started:";
    string i = filesystem::current_path().string();
    system("node consoleSearch.js");
    system("pause");
}