Select id, name, size, concat('file/', id) as "link" from "File"
where "parentId" = $1
order by name;
