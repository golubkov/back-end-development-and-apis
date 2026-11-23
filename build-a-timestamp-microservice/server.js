import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line

app.get(["/api", "/api/:date"], (req, res) => {
  const { date } = req.params;

  let parsedDate;

  if (date === undefined || date === "") {
    parsedDate = new Date();
  } else if (/^-?\d+$/.test(date)) {
    parsedDate = new Date(parseInt(date, 10));
  } else if (/(?:Z|GMT|UTC|[+-]\d{2}:?\d{2})\s*$/i.test(date)) {
    parsedDate = new Date(date);
  } else {
    // Interpret timezone-less date strings as UTC so results are consistent
    // regardless of the server's local timezone.
    const utcInput = date.includes("T") ? `${date}Z` : `${date} UTC`;
    parsedDate = new Date(utcInput);

    if (Number.isNaN(parsedDate.getTime())) {
      parsedDate = new Date(date);
    }
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString(),
  });
});

// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});