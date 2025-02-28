CREATE TABLE sales.slicers (
	id serial4 NOT NULL,
	category text NULL,
	"key" text NULL,
	val text NULL,
	CONSTRAINT slicers_pkey PRIMARY KEY (id)
);