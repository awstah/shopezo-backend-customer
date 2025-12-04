-- DROP TYPE public."category_status_enum";

CREATE TYPE public."category_status_enum" AS ENUM (
	'pending',
	'approved',
	'rejected',
	'admin');

-- DROP TYPE public."driver_current_status_enum";

CREATE TYPE public."driver_current_status_enum" AS ENUM (
	'active',
	'inactive');

-- DROP TYPE public."driver_driver_status_enum";

CREATE TYPE public."driver_driver_status_enum" AS ENUM (
	'busy',
	'free');

-- DROP TYPE public.gtrgm;

CREATE TYPE public.gtrgm (
	INPUT = gtrgm_in,
	OUTPUT = gtrgm_out,
	ALIGNMENT = 4,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP TYPE public."order_driver_assignment_status_enum";

CREATE TYPE public."order_driver_assignment_status_enum" AS ENUM (
	'accepted',
	'assigned',
	'rejected',
	'picked',
	'delivered');

-- DROP TYPE public."order_order_status_enum";

CREATE TYPE public."order_order_status_enum" AS ENUM (
	'cancel',
	'pending',
	'in-progress',
	'out-for-delivery',
	'order-receive',
	'complete',
	'accepted',
	'assigned');

-- DROP TYPE public."order_payment_type_enum";

CREATE TYPE public."order_payment_type_enum" AS ENUM (
	'online',
	'cash-on-delivery');

-- DROP TYPE public."products_status_enum";

CREATE TYPE public."products_status_enum" AS ENUM (
	'pending',
	'approved',
	'rejected',
	'admin');

-- DROP TYPE public."upload_job_status_enum";

CREATE TYPE public."upload_job_status_enum" AS ENUM (
	'pending',
	'completed',
	'failed');

-- DROP TYPE public."user_role_enum";

CREATE TYPE public."user_role_enum" AS ENUM (
	'CUSTOMER',
	'ADMIN',
	'MERCHANT',
	'SHOPKEEPER',
	'DRIVER');

-- DROP TYPE public."user_status_enum";

CREATE TYPE public."user_status_enum" AS ENUM (
	'active',
	'inactive');