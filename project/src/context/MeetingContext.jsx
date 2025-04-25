import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const MeetingContext = createContext();

export const useMeetings = () => useContext(MeetingContext);

export const MeetingProvider = ({ children }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();
  const abortControllerRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Memoized fetch meetings function
  const fetchMeetings = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`${API_URL}/meetings`, {
        signal: abortControllerRef.current.signal,
      });

      if (data.success) {
        setMeetings(data.meetings);
      } else {
        throw new Error(data.message || "Failed to fetch meetings");
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error(
          "Fetch meetings error:",
          error.response?.data?.message || error.message
        );
        setError(error.response?.data?.message || "Failed to fetch meetings");
        toast.error(
          error.response?.data?.message || "Failed to fetch meetings"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Fetch meetings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMeetings();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthenticated, fetchMeetings]);

  // Memoized get meeting by ID function
  const getMeetingById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(`${API_URL}/meetings/${id}`);

        if (data.success) {
          return data.meeting;
        }

        return null;
      } catch (error) {
        console.error(
          "Get meeting error:",
          error.response?.data?.message || error.message
        );
        setError(error.response?.data?.message || "Failed to get meeting");
        toast.error(error.response?.data?.message || "Failed to get meeting");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  const createMeeting = async (meetingData) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/meetings`, meetingData);

      if (data.success) {
        setMeetings([...meetings, data.meeting]);
        toast.success("Meeting created successfully");
        return data.meeting;
      }

      return null;
    } catch (error) {
      console.error(
        "Create meeting error:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "Failed to create meeting");
      toast.error(error.response?.data?.message || "Failed to create meeting");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (id, meetingData) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.put(
        `${API_URL}/meetings/${id}`,
        meetingData
      );

      if (data.success) {
        setMeetings(
          meetings.map((meeting) =>
            meeting._id === id ? data.meeting : meeting
          )
        );
        toast.success("Meeting updated successfully");
        return data.meeting;
      }

      return null;
    } catch (error) {
      console.error(
        "Update meeting error:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "Failed to update meeting");
      toast.error(error.response?.data?.message || "Failed to update meeting");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.delete(`${API_URL}/meetings/${id}`);

      if (data.success) {
        setMeetings(meetings.filter((meeting) => meeting._id !== id));
        toast.success("Meeting deleted successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "Delete meeting error:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "Failed to delete meeting");
      toast.error(error.response?.data?.message || "Failed to delete meeting");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const respondToMeeting = async (id, status) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.put(`${API_URL}/meetings/${id}/respond`, {
        status,
      });

      if (data.success) {
        setMeetings(
          meetings.map((meeting) =>
            meeting._id === id ? data.meeting : meeting
          )
        );
        toast.success(
          `Meeting ${status === "accepted" ? "accepted" : "declined"}`
        );
        return data.meeting;
      }

      return null;
    } catch (error) {
      console.error(
        "Respond to meeting error:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "Failed to respond to meeting");
      toast.error(
        error.response?.data?.message || "Failed to respond to meeting"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Memoized search users function
  const searchUsers = useCallback(
    async (query) => {
      try {
        const { data } = await axios.get(
          `${API_URL}/users/search?query=${query}`
        );

        if (data.success) {
          return data.users;
        }

        return [];
      } catch (error) {
        console.error(
          "Search users error:",
          error.response?.data?.message || error.message
        );
        toast.error(error.response?.data?.message || "Failed to search users");
        return [];
      }
    },
    [API_URL]
  );

  const value = {
    meetings,
    loading,
    error,
    fetchMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    respondToMeeting,
    searchUsers,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
};
