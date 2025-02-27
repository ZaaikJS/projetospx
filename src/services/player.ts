import axios from "axios";

const API_URL = "http://localhost:3000/api/launcher/user";

const getData = async (refreshToken: string) => {
  try {
    const response = await axios.get(API_URL, {
      params: { refreshToken }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export default { getData };