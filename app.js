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

const convertMovieNamePascalCase = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertMovieNamePascalCaseDirector = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
const convertMovieNamePascalCaseMovie = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getAllStateQuery = `
        SELECT 
            *
        FROM 
            movie;`
  const movieArray = await db.all(getAllStateQuery)
  response.send(
    movieArray.map(eachmovie => convertMovieNamePascalCase(eachmovie)),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postDistrictQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES (
      '${directorId}','${movieName}','${leadActor}'
    );`
  const dbResponse = await db.run(postDistrictQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getDistrictQuery = `
  SELECT 
    * 
  FROM 
    movie 
  WHERE 
    movie_id=${movieId};`
  const movie = await db.get(getDistrictQuery)
  response.send(convertMovieNamePascalCase(movie))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateDistrictQuery = `
  UPDATE 
  movie SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}'
  WHERE movie_id=${movieId};`
  await db.run(updateDistrictQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteDistrictQuery = `
  DELETE FROM 
    movie 
  WHERE movie_id=${movieId};`
  await db.run(deleteDistrictQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getAllStateQuery = `
        SELECT 
            *
        FROM 
            director;`
  const movieArray = await db.all(getAllStateQuery)
  console.log(movieArray)
  response.send(
    movieArray.map(eachdirector =>
      convertMovieNamePascalCaseDirector(eachdirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDistrictQuery = `
  SELECT 
    * 
  FROM 
    movie 
  WHERE 
    director_id=${directorId};`
  const movie = await db.get(getDistrictQuery)
  response.send(convertMovieNamePascalCaseMovie(movie))
})

module.export = app
