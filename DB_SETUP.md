**Command Executed:**

```bash
psql postgres -c "CREATE USER memi_user WITH PASSWORD 'your-passphrase';"
```

**Output:**

```
CREATE ROLE
```

**Command Executed:**

```bash
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE memi_db TO memi_user;"
```

**Output:**

```
GRANT
```

**Command Executed:**

```bash
psql memi_db -c "GRANT ALL ON SCHEMA public TO memi_user;"
```

**Output:**

```
GRANT
```

**Command Executed:**

```bash
psql memi_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO memi_user;"
```

```bash
psql postgres -c "ALTER USER memi_user CREATEDB;"
```

**Output:**

```
ALTER DEFAULT PRIVILEGES
```

Now I'll update the `.env` file with the new user credentials:

Perfect! I've created the PostgreSQL user `memi_user` and granted all necessary privileges.

Now please replace `{{DB_PASSWORD}}` in the `.env` file with the password you set (the one you edited when creating the user).

After that, you can run the migrations:

```bash
pnpm prisma migrate dev --name init
```
