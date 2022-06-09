grant all privileges on mydb.* TO 'user'@'%' IDENTIFIED BY 'userpass';
grant SUPER on *.* to 'user'@'%' IDENTIFIED BY 'userpass';
FLUSH PRIVILEGES;