const app = require("./app");

const port = +process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    // `a server is listening for requests on port ${port} at http://localhost:${port}/`
    `a server is listening for requests`
  );
});
