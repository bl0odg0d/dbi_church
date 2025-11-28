drop database if exists church;
create database church;
\c church;

create table ranks (
	r_id int primary key,
	r_name varchar(255),
	r_parent int references ranks (r_id)
);

insert into ranks values 
(1,'pope',1),
(2,'cardinals',1),
(3,'bishop',2),
(4,'priest',3),
(5,'deacons',4),
(6,'Abbess',5),
(7,'nun',6),
(8,'monks',6),
(9,'laity',5);

drop user if exists interface;
create user interface with password 'password';
grant select on all tables in schema public to interface;