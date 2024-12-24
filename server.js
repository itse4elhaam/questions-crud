const express = require("express")
const app = express()

// use express.json() as a middleware to make the body available
app.use(express.json());

require("dotenv").config()

const PORT = process.env.PORT;
const dbUrl = process.env.DB_URL;

// listen to the port to make it available
app.listen(PORT, () => {
  console.log(`Server up and running at -> http://localhost${PORT}`)
})

const { neon } = require("@neondatabase/serverless");

const sql = neon(dbUrl);

// req object contains all of the information about the req recieved from the frontend
app.get("/api", async (req, res) => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  console.log(`
    server.js:26
    version ->
    ${version}
  `)

  return res.status(200).send("Hello, world")
})

const endpoint = "/api/questions";

async function handleGetData(req,res){
  try {
    const questionsData = await sql(`SELECT * from questions;`)

    return res.status(200).send({
      data: questionsData,
      message: "Questions fetched successfully"
    })
  } catch (error) {
    console.log("error", error)
    return res.status(500).send({
      message: "Internal server error"
    })
  }
}

// questions crud
app.get(endpoint, handleGetData)

async function handlePostData(req, res) {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).send({
        message: "Question or answer cannot be null"
      })
    }

    await sql(`INSERT INTO questions (id, question, answer, date_created)
VALUES (default, '${question}', '${answer}',  default);
`)

    return res.status(200).send({
      message: "Created"
    })
  } catch (error) {
    console.log("error", error)
    return res.status(500).send({
      message: "Internal server error"
    })
  }
}

// validate the data and parametized query
app.post(endpoint, handlePostData)


// TODO: implement update and delete endpoints

