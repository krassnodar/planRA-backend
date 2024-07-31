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
const port = process.env.PORT || 500;

app.use(cors());
app.use(express.json());

app.post("/api/replicate", async (req, res) => {
  console.log("SERVER REQUEST: ", req.body);
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

    console.log("RESPONSE:  ", response);
    res.json(response.data);
  } catch (error: any) {
    const customError = error as CustomError;
    customError?.response &&
      console.log("ERROR response:  ", customError.response.data);
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
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
