-- public.migrations definition

-- Drop table

-- DROP TABLE public.migrations;

CREATE TABLE public.migrations (
	id serial4 NOT NULL,
	"timestamp" int8 NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.migrations OWNER TO postgres;
GRANT ALL ON TABLE public.migrations TO postgres;
GRANT ALL ON TABLE public.migrations TO anon;
GRANT ALL ON TABLE public.migrations TO authenticated;
GRANT ALL ON TABLE public.migrations TO service_role;


-- public.typeorm_metadata definition

-- Drop table

-- DROP TABLE public.typeorm_metadata;

CREATE TABLE public.typeorm_metadata (
	"type" varchar NOT NULL,
	"database" varchar NULL,
	"schema" varchar NULL,
	"table" varchar NULL,
	"name" varchar NULL,
	value text NULL
);

-- Permissions

ALTER TABLE public.typeorm_metadata OWNER TO postgres;
GRANT ALL ON TABLE public.typeorm_metadata TO postgres;
GRANT ALL ON TABLE public.typeorm_metadata TO anon;
GRANT ALL ON TABLE public.typeorm_metadata TO authenticated;
GRANT ALL ON TABLE public.typeorm_metadata TO service_role;


-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	email varchar NOT NULL,
	username varchar NOT NULL,
	phone_number varchar NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" public."user_role_enum" DEFAULT 'CUSTOMER'::user_role_enum NOT NULL,
	supabase_user_id varchar NOT NULL,
	parent_user_id uuid NULL,
	first_name varchar(255) NULL,
	last_name varchar(255) NULL,
	is_verified bool DEFAULT false NOT NULL,
	status public."user_status_enum" DEFAULT 'active'::user_status_enum NOT NULL,
	profile_picture_url varchar NULL,
	hashed_refresh_token varchar NULL,
	is_email_verified bool DEFAULT false NOT NULL,
	is_phone_verified bool DEFAULT false NOT NULL,
	CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
	CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username),
	CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email),
	CONSTRAINT "FK_bc6d7a9da372154fdd56686f03a" FOREIGN KEY (parent_user_id) REFERENCES public."user"(id)
);

-- Permissions

ALTER TABLE public."user" OWNER TO postgres;
GRANT ALL ON TABLE public."user" TO postgres;
GRANT ALL ON TABLE public."user" TO anon;
GRANT ALL ON TABLE public."user" TO authenticated;
GRANT ALL ON TABLE public."user" TO service_role;


-- public.user_payment_method definition

-- Drop table

-- DROP TABLE public.user_payment_method;

CREATE TABLE public.user_payment_method (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	card_holder_name varchar NOT NULL,
	card_number varchar NOT NULL,
	card_brand varchar NOT NULL,
	expiry_month varchar NOT NULL,
	expiry_year varchar NOT NULL,
	cvv varchar NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	is_default bool DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	user_id uuid NULL,
	CONSTRAINT "PK_7bc6324e8d41c2f3bd69c1d905f" PRIMARY KEY (id),
	CONSTRAINT "FK_410a5c63b418406480c3fd3c7d6" FOREIGN KEY (user_id) REFERENCES public."user"(id)
);

-- Permissions

ALTER TABLE public.user_payment_method OWNER TO postgres;
GRANT ALL ON TABLE public.user_payment_method TO postgres;
GRANT ALL ON TABLE public.user_payment_method TO anon;
GRANT ALL ON TABLE public.user_payment_method TO authenticated;
GRANT ALL ON TABLE public.user_payment_method TO service_role;


-- public.category definition

-- Drop table

-- DROP TABLE public.category;

CREATE TABLE public.category (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	category_name varchar NOT NULL,
	category_image varchar NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	parent_id uuid NULL,
	slug varchar NULL,
	is_active bool DEFAULT true NOT NULL,
	status public."category_status_enum" DEFAULT 'pending'::category_status_enum NOT NULL,
	added_by uuid NULL,
	CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY (id),
	CONSTRAINT "UQ_9359e3b1d5e90d7a0fbe3b28077" UNIQUE (category_name),
	CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE (slug),
	CONSTRAINT "FK_0e52894bd29bf2e61cef73ecca5" FOREIGN KEY (added_by) REFERENCES public."user"(id),
	CONSTRAINT "FK_1117b4fcb3cd4abb4383e1c2743" FOREIGN KEY (parent_id) REFERENCES public.category(id) ON DELETE SET NULL
);

-- Permissions

ALTER TABLE public.category OWNER TO postgres;
GRANT ALL ON TABLE public.category TO postgres;
GRANT ALL ON TABLE public.category TO anon;
GRANT ALL ON TABLE public.category TO authenticated;
GRANT ALL ON TABLE public.category TO service_role;


-- public.customer definition

-- Drop table

-- DROP TABLE public.customer;

CREATE TABLE public.customer (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY (id),
	CONSTRAINT "REL_5d1f609371a285123294fddcf3" UNIQUE (user_id),
	CONSTRAINT "FK_5d1f609371a285123294fddcf3a" FOREIGN KEY (user_id) REFERENCES public."user"(id)
);

-- Permissions

ALTER TABLE public.customer OWNER TO postgres;
GRANT ALL ON TABLE public.customer TO postgres;
GRANT ALL ON TABLE public.customer TO anon;
GRANT ALL ON TABLE public.customer TO authenticated;
GRANT ALL ON TABLE public.customer TO service_role;


-- public.customer_address definition

-- Drop table

-- DROP TABLE public.customer_address;

CREATE TABLE public.customer_address (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	address_line varchar(255) NOT NULL,
	city varchar(255) NOT NULL,
	state varchar(255) NOT NULL,
	country varchar(255) NOT NULL,
	postal_code varchar(20) NULL,
	"label" varchar(50) NULL,
	is_primary bool DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	customer_id uuid NULL,
	is_active bool DEFAULT false NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	latitude float8 NULL,
	longitude float8 NULL,
	CONSTRAINT "PK_23810fb397050d8ac37dae44ff6" PRIMARY KEY (id),
	CONSTRAINT "FK_1f5ed21a5f3390cdbafb6f22452" FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.customer_address OWNER TO postgres;
GRANT ALL ON TABLE public.customer_address TO postgres;
GRANT ALL ON TABLE public.customer_address TO anon;
GRANT ALL ON TABLE public.customer_address TO authenticated;
GRANT ALL ON TABLE public.customer_address TO service_role;


-- public.merchant definition

-- Drop table

-- DROP TABLE public.merchant;

CREATE TABLE public.merchant (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	address_1 varchar(255) NOT NULL,
	address_2 varchar(255) NULL,
	country varchar(255) NOT NULL,
	state varchar(255) NOT NULL,
	city varchar(255) NOT NULL,
	businessname varchar(255) NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_9a3850e0537d869734fc9bff5d6" PRIMARY KEY (id),
	CONSTRAINT "REL_8f6d566c4af17752c436870dc7" UNIQUE (user_id),
	CONSTRAINT "FK_8f6d566c4af17752c436870dc7f" FOREIGN KEY (user_id) REFERENCES public."user"(id)
);

-- Permissions

ALTER TABLE public.merchant OWNER TO postgres;
GRANT ALL ON TABLE public.merchant TO postgres;
GRANT ALL ON TABLE public.merchant TO anon;
GRANT ALL ON TABLE public.merchant TO authenticated;
GRANT ALL ON TABLE public.merchant TO service_role;


-- public.products definition

-- Drop table

-- DROP TABLE public.products;

CREATE TABLE public.products (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	product_name varchar NOT NULL,
	description text NULL,
	product_size varchar NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	category_id uuid NULL,
	slug varchar NULL,
	status public."products_status_enum" DEFAULT 'pending'::products_status_enum NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	added_by uuid NULL,
	barcode varchar NULL,
	CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id),
	CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE (slug),
	CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e" UNIQUE (barcode),
	CONSTRAINT "FK_103cec6966ad062a779ec25536e" FOREIGN KEY (added_by) REFERENCES public."user"(id),
	CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY (category_id) REFERENCES public.category(id) ON DELETE SET NULL
);

-- Permissions

ALTER TABLE public.products OWNER TO postgres;
GRANT ALL ON TABLE public.products TO postgres;
GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


-- public.stores definition

-- Drop table

-- DROP TABLE public.stores;

CREATE TABLE public.stores (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	store_name varchar NOT NULL,
	store_address varchar NOT NULL,
	store_logo varchar NULL,
	user_id uuid NULL,
	is_deleted bool DEFAULT false NOT NULL,
	merchant_id uuid NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	latitude float8 NULL,
	longitude float8 NULL,
	CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY (id),
	CONSTRAINT "FK_29f39971656b4bf7832b7476d10" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE,
	CONSTRAINT "FK_882687fd3a8a29fa5bf13858a5b" FOREIGN KEY (merchant_id) REFERENCES public.merchant(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.stores OWNER TO postgres;
GRANT ALL ON TABLE public.stores TO postgres;
GRANT ALL ON TABLE public.stores TO anon;
GRANT ALL ON TABLE public.stores TO authenticated;
GRANT ALL ON TABLE public.stores TO service_role;


-- public.temp_products definition

-- Drop table

-- DROP TABLE public.temp_products;

CREATE TABLE public.temp_products (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	barcode varchar NULL,
	title varchar NULL,
	category varchar NULL,
	unit varchar NULL,
	packaging varchar NULL,
	inventory_type varchar NULL,
	merchant_id uuid NULL,
	file_name varchar NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	product_id uuid NULL,
	description text NULL,
	is_archive bool DEFAULT false NOT NULL,
	is_published bool DEFAULT false NOT NULL,
	CONSTRAINT "PK_c3a4f80c99a4722660716a0750e" PRIMARY KEY (id),
	CONSTRAINT "FK_2c0e6a374f8fc10ec7350c50451" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
	CONSTRAINT "FK_7835b2f34cf07e95f9ba0f0b87e" FOREIGN KEY (merchant_id) REFERENCES public.merchant(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.temp_products OWNER TO postgres;
GRANT ALL ON TABLE public.temp_products TO postgres;
GRANT ALL ON TABLE public.temp_products TO anon;
GRANT ALL ON TABLE public.temp_products TO authenticated;
GRANT ALL ON TABLE public.temp_products TO service_role;


-- public.upload_job definition

-- Drop table

-- DROP TABLE public.upload_job;

CREATE TABLE public.upload_job (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	file_name varchar NOT NULL,
	total_csv_records int4 DEFAULT 0 NOT NULL,
	total_inserted int4 DEFAULT 0 NOT NULL,
	status public."upload_job_status_enum" DEFAULT 'pending'::upload_job_status_enum NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	completed_at timestamp NULL,
	merchant_id uuid NULL,
	CONSTRAINT "PK_5d9d3a63b057c2d0a5632e0645a" PRIMARY KEY (id),
	CONSTRAINT "FK_a402764b9f63bff2bdc0fe10cf7" FOREIGN KEY (merchant_id) REFERENCES public.merchant(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.upload_job OWNER TO postgres;
GRANT ALL ON TABLE public.upload_job TO postgres;
GRANT ALL ON TABLE public.upload_job TO anon;
GRANT ALL ON TABLE public.upload_job TO authenticated;
GRANT ALL ON TABLE public.upload_job TO service_role;


-- public.banners definition

-- Drop table

-- DROP TABLE public.banners;

CREATE TABLE public.banners (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	title varchar NULL,
	image varchar NULL,
	is_deleted bool DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	user_id uuid NULL,
	store_id uuid NULL,
	CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY (id),
	CONSTRAINT "FK_1e5e62d374c6dc59b0c3058850d" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE,
	CONSTRAINT "FK_43a2ec64f37cdeb44a1b7f345e1" FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.banners OWNER TO postgres;
GRANT ALL ON TABLE public.banners TO postgres;
GRANT ALL ON TABLE public.banners TO anon;
GRANT ALL ON TABLE public.banners TO authenticated;
GRANT ALL ON TABLE public.banners TO service_role;


-- public.cart definition

-- Drop table

-- DROP TABLE public.cart;

CREATE TABLE public.cart (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	customer_id uuid NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY (id),
	CONSTRAINT "REL_242205c81c1152fab1b6e84847" UNIQUE (customer_id),
	CONSTRAINT "FK_242205c81c1152fab1b6e848470" FOREIGN KEY (customer_id) REFERENCES public.customer(id)
);

-- Permissions

ALTER TABLE public.cart OWNER TO postgres;
GRANT ALL ON TABLE public.cart TO postgres;
GRANT ALL ON TABLE public.cart TO anon;
GRANT ALL ON TABLE public.cart TO authenticated;
GRANT ALL ON TABLE public.cart TO service_role;


-- public.product_duplicates definition

-- Drop table

-- DROP TABLE public.product_duplicates;

CREATE TABLE public.product_duplicates (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	temp_product_id uuid NULL,
	product_id uuid NULL,
	file_name varchar NULL,
	CONSTRAINT "PK_cd18961534c6646cbe8cb4a7ab1" PRIMARY KEY (id),
	CONSTRAINT "FK_7e4eb8d37af2e945660939fd4b3" FOREIGN KEY (temp_product_id) REFERENCES public.temp_products(id) ON DELETE CASCADE,
	CONSTRAINT "FK_c841c801aba938c5fad0741c9ca" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.product_duplicates OWNER TO postgres;
GRANT ALL ON TABLE public.product_duplicates TO postgres;
GRANT ALL ON TABLE public.product_duplicates TO anon;
GRANT ALL ON TABLE public.product_duplicates TO authenticated;
GRANT ALL ON TABLE public.product_duplicates TO service_role;


-- public.product_images definition

-- Drop table

-- DROP TABLE public.product_images;

CREATE TABLE public.product_images (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	url varchar NOT NULL,
	product_id uuid NULL,
	is_deleted bool DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	temp_product_id uuid NULL,
	CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY (id),
	CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
	CONSTRAINT "FK_a08afa3614eefe87b3727fd0bcb" FOREIGN KEY (temp_product_id) REFERENCES public.temp_products(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.product_images OWNER TO postgres;
GRANT ALL ON TABLE public.product_images TO postgres;
GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;


-- public.shop_product definition

-- Drop table

-- DROP TABLE public.shop_product;

CREATE TABLE public.shop_product (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	stock int4 DEFAULT 0 NOT NULL,
	is_available bool DEFAULT true NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	store_id uuid NULL,
	product_id uuid NULL,
	discount int4 DEFAULT 0 NOT NULL,
	reviews int4 DEFAULT 0 NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	added_by uuid NULL,
	sku varchar NULL,
	price numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	CONSTRAINT "PK_996a8daa7de87ae4e68ef98c9f1" PRIMARY KEY (id),
	CONSTRAINT "FK_1a4ac5793fadceeca264d8d6b23" FOREIGN KEY (added_by) REFERENCES public."user"(id) ON DELETE SET NULL,
	CONSTRAINT "FK_1bdb70cace4d977ff9b852cfcbf" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
	CONSTRAINT "FK_94fd5efba67eab8cce852c90a4c" FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.shop_product OWNER TO postgres;
GRANT ALL ON TABLE public.shop_product TO postgres;
GRANT ALL ON TABLE public.shop_product TO anon;
GRANT ALL ON TABLE public.shop_product TO authenticated;
GRANT ALL ON TABLE public.shop_product TO service_role;


-- public.shopkepper definition

-- Drop table

-- DROP TABLE public.shopkepper;

CREATE TABLE public.shopkepper (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	address_1 varchar(255) NOT NULL,
	address_2 varchar(255) NULL,
	country varchar(255) NOT NULL,
	state varchar(255) NOT NULL,
	city varchar(255) NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	merchant_id uuid NULL,
	store_id uuid NULL,
	CONSTRAINT "PK_cbee67b1f3c5e72b132d0ae3217" PRIMARY KEY (id),
	CONSTRAINT "REL_9e033a1f74192a5868dba9daac" UNIQUE (user_id),
	CONSTRAINT "FK_1ce1cbd57acbf9614d4882f92de" FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
	CONSTRAINT "FK_8849e4bcd4024713b2dc73e4ea6" FOREIGN KEY (merchant_id) REFERENCES public.merchant(id) ON DELETE CASCADE,
	CONSTRAINT "FK_9e033a1f74192a5868dba9daac4" FOREIGN KEY (user_id) REFERENCES public."user"(id)
);

-- Permissions

ALTER TABLE public.shopkepper OWNER TO postgres;
GRANT ALL ON TABLE public.shopkepper TO postgres;
GRANT ALL ON TABLE public.shopkepper TO anon;
GRANT ALL ON TABLE public.shopkepper TO authenticated;
GRANT ALL ON TABLE public.shopkepper TO service_role;


-- public.cart_item definition

-- Drop table

-- DROP TABLE public.cart_item;

CREATE TABLE public.cart_item (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	quantity int4 NOT NULL,
	cart_id uuid NULL,
	shop_product_id uuid NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY (id),
	CONSTRAINT "FK_adb25df42a8bc7fb21494d3a3d5" FOREIGN KEY (shop_product_id) REFERENCES public.shop_product(id),
	CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941" FOREIGN KEY (cart_id) REFERENCES public.cart(id)
);

-- Permissions

ALTER TABLE public.cart_item OWNER TO postgres;
GRANT ALL ON TABLE public.cart_item TO postgres;
GRANT ALL ON TABLE public.cart_item TO anon;
GRANT ALL ON TABLE public.cart_item TO authenticated;
GRANT ALL ON TABLE public.cart_item TO service_role;


-- public.driver definition

-- Drop table

-- DROP TABLE public.driver;

CREATE TABLE public.driver (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	address_1 varchar(255) NOT NULL,
	address_2 varchar(255) NULL,
	country varchar(255) NOT NULL,
	state varchar(255) NOT NULL,
	city varchar(255) NOT NULL,
	vehicle_type varchar(255) NOT NULL,
	license_number varchar(255) NOT NULL,
	current_status public."driver_current_status_enum" DEFAULT 'inactive'::driver_current_status_enum NOT NULL,
	current_location varchar(255) NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	merchant_id uuid NULL,
	store_id uuid NULL,
	shopkeeper_id uuid NULL,
	driver_status public."driver_driver_status_enum" DEFAULT 'free'::driver_driver_status_enum NOT NULL,
	CONSTRAINT "PK_61de71a8d217d585ecd5ee3d065" PRIMARY KEY (id),
	CONSTRAINT "REL_732fa4b746b5fd36d24e72576e" UNIQUE (user_id),
	CONSTRAINT "FK_0253b5e3050d6941f7e20fca180" FOREIGN KEY (shopkeeper_id) REFERENCES public.shopkepper(id) ON DELETE CASCADE,
	CONSTRAINT "FK_64dd16da27176fd1f761f268fc7" FOREIGN KEY (merchant_id) REFERENCES public.merchant(id) ON DELETE CASCADE,
	CONSTRAINT "FK_732fa4b746b5fd36d24e72576e7" FOREIGN KEY (user_id) REFERENCES public."user"(id),
	CONSTRAINT "FK_f36cc24b5242db34f5b2c0277dc" FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.driver OWNER TO postgres;
GRANT ALL ON TABLE public.driver TO postgres;
GRANT ALL ON TABLE public.driver TO anon;
GRANT ALL ON TABLE public.driver TO authenticated;
GRANT ALL ON TABLE public.driver TO service_role;


-- public.favourites definition

-- Drop table

-- DROP TABLE public.favourites;

CREATE TABLE public.favourites (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	is_fav bool DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	user_id uuid NULL,
	shop_product_id uuid NULL,
	store_id uuid NULL,
	CONSTRAINT "PK_173e5d5cc35490bf1de2d2d3739" PRIMARY KEY (id),
	CONSTRAINT "FK_9e03de29df3cde505db326df451" FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
	CONSTRAINT "FK_f0193e5b279019dab35619a708d" FOREIGN KEY (shop_product_id) REFERENCES public.shop_product(id) ON DELETE CASCADE,
	CONSTRAINT "FK_ffb0866c42b7ff4d6e5131f3dcc" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.favourites OWNER TO postgres;
GRANT ALL ON TABLE public.favourites TO postgres;
GRANT ALL ON TABLE public.favourites TO anon;
GRANT ALL ON TABLE public.favourites TO authenticated;
GRANT ALL ON TABLE public.favourites TO service_role;


-- public."order" definition

-- Drop table

-- DROP TABLE public."order";

CREATE TABLE public."order" (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	order_status public."order_order_status_enum" DEFAULT 'pending'::order_order_status_enum NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	customer_id uuid NULL,
	total_amount numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	address varchar NULL,
	payment_type public."order_payment_type_enum" DEFAULT 'cash-on-delivery'::order_payment_type_enum NULL,
	customer_address_id uuid NULL,
	total_discounted_amount numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	total_payable_amount numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	driver_id uuid NULL,
	order_number varchar(20) NULL,
	delivery_image varchar NULL,
	geo_location varchar NULL,
	CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY (id),
	CONSTRAINT "UQ_f9180f384353c621e8d0c414c14" UNIQUE (order_number),
	CONSTRAINT "FK_71e6299877e37f03f2a00527fff" FOREIGN KEY (driver_id) REFERENCES public.driver(id),
	CONSTRAINT "FK_cd7812c96209c5bdd48a6b858b0" FOREIGN KEY (customer_id) REFERENCES public.customer(id),
	CONSTRAINT "FK_efb22de9bf649b1a224074a8cc6" FOREIGN KEY (customer_address_id) REFERENCES public.customer_address(id)
);

-- Permissions

ALTER TABLE public."order" OWNER TO postgres;
GRANT ALL ON TABLE public."order" TO postgres;
GRANT ALL ON TABLE public."order" TO anon;
GRANT ALL ON TABLE public."order" TO authenticated;
GRANT ALL ON TABLE public."order" TO service_role;


-- public.order_driver_assignment definition

-- Drop table

-- DROP TABLE public.order_driver_assignment;

CREATE TABLE public.order_driver_assignment (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	status public."order_driver_assignment_status_enum" DEFAULT 'assigned'::order_driver_assignment_status_enum NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	order_id uuid NULL,
	driver_id uuid NULL,
	assigned_by uuid NULL,
	CONSTRAINT "PK_ba201bd8e4878b5dcafb8a219fe" PRIMARY KEY (id),
	CONSTRAINT "FK_29ea14c396751126d5a3747c2c9" FOREIGN KEY (assigned_by) REFERENCES public."user"(id),
	CONSTRAINT "FK_460bb87b9142a59fe6cb37e0c9a" FOREIGN KEY (driver_id) REFERENCES public.driver(id) ON DELETE CASCADE,
	CONSTRAINT "FK_7aae84cf0c6aa1adb5780843059" FOREIGN KEY (order_id) REFERENCES public."order"(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.order_driver_assignment OWNER TO postgres;
GRANT ALL ON TABLE public.order_driver_assignment TO postgres;
GRANT ALL ON TABLE public.order_driver_assignment TO anon;
GRANT ALL ON TABLE public.order_driver_assignment TO authenticated;
GRANT ALL ON TABLE public.order_driver_assignment TO service_role;


-- public.order_item definition

-- Drop table

-- DROP TABLE public.order_item;

CREATE TABLE public.order_item (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	quantity int4 NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	order_id uuid NULL,
	shop_product_id uuid NULL,
	price numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	total_amount numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	discounted_amount numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	payable_amount numeric(10, 2) DEFAULT '0'::numeric NOT NULL,
	CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY (id),
	CONSTRAINT "FK_bc36f05ca940032df8b41cecb1e" FOREIGN KEY (shop_product_id) REFERENCES public.shop_product(id),
	CONSTRAINT "FK_e9674a6053adbaa1057848cddfa" FOREIGN KEY (order_id) REFERENCES public."order"(id)
);

-- Permissions

ALTER TABLE public.order_item OWNER TO postgres;
GRANT ALL ON TABLE public.order_item TO postgres;
GRANT ALL ON TABLE public.order_item TO anon;
GRANT ALL ON TABLE public.order_item TO authenticated;
GRANT ALL ON TABLE public.order_item TO service_role;