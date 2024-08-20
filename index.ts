import { Pool } from "pg";
import dotenv from 'dotenv'; 
import { env } from "process";

dotenv.config();

const pool = new Pool({
  host: env.POSTGRES_HOST,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: env.POSTGRES_PORT ? parseInt(env.POSTGRES_PORT) : 5432,
  idleTimeoutMillis: 30000,
});

class Todo{
    id: number = 0;
    name: string = "";

    constructor(id: number, name: string)
    {
        this.id = id;
        this.name = name;
    }
}

const getTodoList = async () => {
    try {
        const result = await pool.query("SELECT id, name FROM todo");
        const users = result.rows;
        console.log(users);
    } catch (error) {
        console.log(error);
    }
};

const createTodo = async (name:string) => {
    try {
        const insertUser = "INSERT INTO todo (name) VALUES ($1) RETURNING *";
        const result = await pool.query(insertUser, [name]);
        if( result.rows.length == 1 )
        {
            const user = result.rows[0];
            console.log(user);
        }
    } catch (error) {
        console.log(error);
    }
}

const getTodo = async (id:number) => {
    try {
        const result = await pool.query("SELECT id, name FROM todo WHERE id = $1", [id]);
        
        if(result.rows.length == 1)
        {
            const user = result.rows[0];
            console.log(user);
        }
    } catch (error) {
        console.log(error);
    }
};

const updateTodo = async (data:Todo) => {
    try {
        const id = data.id;
        const name = data.name;
        const result = await pool.query("UPDATE todo SET name = $1 WHERE id = $2;", [name, id]);
        console.log(result);
        if(result.rowCount == 1)
        {
            console.log(data.id);
        }
    } catch (error) {
        console.log(error);
    }
};

const deleteTodo = async (id:number) => {
    try {
        const result = await pool.query("DELETE FROM todo WHERE id = $1", [id]);
        
        if(result.rowCount == 1)
        {
            console.log(id);
        }
    } catch (error) {
        console.log(error);
    }
};

export default pool;