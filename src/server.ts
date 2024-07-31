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

const token = "r8_2KIjO8haeidixlFf06D7w8sfwbgZOtS3ywm7L";

app.post("/api/replicate", async (req, res) => {
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

    res.json(response.data);
  } catch (error: any) {
    const customError = error as CustomError;
    customError?.response &&
      console.log("[ERROR]: основной запрос:  ", customError.response.data);
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
          Authorization: `Token ${token}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    const customError = error as CustomError;
    customError?.response &&
      console.log("[ERROR]: predict запрос:  ", customError.response.data);
    res
      .status(500)
      .json({ error: customError.response?.data.title || "Unknown error" });
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
