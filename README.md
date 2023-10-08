# vk.com-msg-parser
Browser script using [Violent Monkey](https://github.com/violentmonkey) to scrape text of user's vk.com conversations.

Script using [Violent Monkey](https://github.com/violentmonkey) for "online" scrapping of user's vk.com conversations. 
VK-API does not allow acces to user's messages, so this the only viable option I've found.
Script works on "im" page load and reload with a prompt to confirm the start of a proccess of collecting data. 
Data itself will be stored in "Data" section of Violent Monkey which, I belive,
is a local storage.

To download .csv file - cancel first promt and click "ok" on the second one
which will creat and download desired dataset file. Dataset will be presented as 
follows:

| index | user_id | text                            |
|-------|---------|---------------------------------|
| 0     | 133713  | Hello, Connor, how are you?     |
| 1     | 22869   | Hi, Markus, I'm fine! And you?  |
| 2     | 133713  | Me too!                         |
| ----- | ------- | ------------------------------- |

With this kind of dataset it will be possible to create your own LLM by training transformer. Please be cautious and 
consider using such dataset as a private learning tool for obvious reasons.

Link for Violent Monkey script: https://openuserjs.org/scripts/suffermuffin/msg_parser-vk.com