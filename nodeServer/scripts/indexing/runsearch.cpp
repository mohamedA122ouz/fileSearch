#include <iostream>
#include <filesystem>
using namespace std;
int main()
{
    string i = filesystem::current_path().string();
    int ii = 0;
        system("node indexingM.js");

    system("pause");
}