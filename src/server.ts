import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

interface AxiosErrorResponse {
  data: {
    title: string;
  };
}

interface CustomError extends Error {
  response?: AxiosErrorResponse;
}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/replicate", async (req, res) => {
  console.log("SERVER REQUEST: ", req.body);
  console.log("REPLICATE_API_KEY: ", process.env.REPLICATE_API_KEY);

  try {
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      }
    );

    // console.log("RESPONSE:  ", response);
    res.json(response.data);
  } catch (error: any) {
    console.log("[ERROR]:  ", error);
    const customError = error as CustomError;
    customError?.response &&
      console.log("[ERROR]: оссновной запрос:  ", customError.response.data);
    res
      .status(500)
      .json({ error: customError.response?.data.title || "Unknown error" });
  }
});

app.get("/api/replicate/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${req.params.id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.log("[ERROR]: predict запрос:  ", error);

    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

const server = app.listen(port, () => {
  const addressInfo = server.address();
  if (addressInfo && typeof addressInfo === "object") {
    let host = addressInfo.address;
    const port = addressInfo.port;

    if (host === "::") {
      host = "localhost"; // This will make it more readable for most common cases
    }

    console.log(`Server is running on http://${host}:${port}`);
  } else {
    console.error("Failed to get the address information");
  }
});
