const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const dbObjectToResponseObject = dbMovieObject => {
  return {
    movieId: dbMovieObject.movie_id,
    directorId: dbMovieObject.director_id,
    movieName: dbMovieObject.movie_name,
    leadActor: dbMovieObject.lead_actor,
  }
}
const dbDirectorObjectToResponseObject = dbDirectorObject => {
  return {
    directorId: dbMovieObject.director_id,

    directorName: dbMovieObject.director_name,
  }
}
//API1

app.get('/movies/', async (request, response) => {
  const getMovieNames = `
  SELECT movie_name as movieName FROM movie;`
  const movieNameList = await db.all(getMovieNames)
  response.send(movieNameList)
})

//API2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieDetails = `
INSERT INTO movie(director_id,movie_name,lead_actor)
VALUES('${directorId}','${movieName}','${leadActor}');`
  const dbResponse = await db.run(addMovieDetails)
  response.send('Movie Successfully Added')
})

//API3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getOneMovie = `
  SELECT * FROM movie WHERE movie_id=${movieId};`
  const oneMovie = await db.get(getOneMovie)
  response.send(dbObjectToResponseObject(oneMovie))
})

//API4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovie = `
  UPDATE movie
  SET director_id=${directorId},movie_name='${movieName}',
  lead_actor="${leadActor}" 
  WHERE movie_id=${movieId};`
  await db.run(updateMovie)
  response.send('Movie Details Updated')
})

//API5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`
  await db.run(deleteMovie)
  response.send('Movie Removed')
})

//API6

app.get('/directors/', async (request, response) => {
  const directorList = `
    SELECT
     *
    FROM
     movie;
    `;
  const directors = await db.all(directorList)
  response.send(
    directors.map((eachDirector) =>
      dbDirectorObjectToResponseObject(eachDirector),
    ),
  )
})

//API7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const movieNameDirectors = `
    SELECT
     movie_name
    FROM
     movie
    WHERE
      director_id = ${directorId};`
  const directorListItems = await db.all(movieNameDirectors)
  response.send(
    directorListItems.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

module.exports = app
