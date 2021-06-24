import re
import sys

file_name = sys.argv[1]

f = open(file_name, "r")
read_file = f.read()

findAllLog = re.findall("{(.*?)}", read_file)
write_file = open("results.log", "w")
for i in findAllLog:
  if len(i) and i[:3]!="0x1":
    write_file.write("{"+i+"}\n")
