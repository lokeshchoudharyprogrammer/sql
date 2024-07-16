const express = require("express");
const { Pool } = require("pg");


const app = express();

app.use(express.json());


const pool = new Pool({
    connectionString: 'postgresql://testApplication_owner:j7ZbdKWnSO2q@ep-billowing-moon-a50q1b1l-pooler.us-east-2.aws.neon.tech/testApplication?sslmode=require',
});


app.post("/todo", async (req, res) => {
    
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    const query = `INSERT INTO Todos(name, description) VALUES($1, $2) RETURNING *`;
    const values = [name, description];

    try {
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});


app.get("/todo", async (req, res) => {
    try {
        res.status(200).json({
            message: "Todo list",
            todo: await pool.query(`SELECT * FROM Todos`)
        })
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong"
        })
    }
});

app.put("/todo", async (req, res) => {
    const { id, name, description } = req.body;
    if (!id || !name || !description) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    const query = `UPDATE Todos SET name=$1, description=$2 WHERE id=$3 RETURNING *`;
    const values = [name, description, id];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json({
            message: "Todo updated",
            todo: result.rows[0],
        });
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});


app.delete("/todo", async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).send("id not provided try again");

    try {
        const query = `DELETE FROM Todos WHERE id=$1 RETURNING *`;
        const values = [id];
        const result = await pool.query(query, values);
        res.status(200).json({
            message: "Todo deleted",
            todo: result.rows[0],
        });

    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({
            message: "Something went wrong",
        });


    }

})

app.get("/create-table", async (req, res) => {

    try {

        await pool.connect();
        const result = await pool.query(`
        CREATE TABLE Moviess (
        name VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        `);
        console.log("created");

        res.status(200).json({
            message: "Table created",
            result
        })
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({
            message: "Something went wrong",
        });

    }

    await pool.end();



})




app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
