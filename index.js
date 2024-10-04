import app from "./src/app.js";

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log("http://localhost:"+ port +"/api");
});

process.on("SIGINT", async ()=>{
    console.log('Saliendo...')
    process.exit()
})