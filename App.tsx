import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import RequestCard from "./RequestCard";

const API_URL = "http://192.168.40.2:8080/api/v1/requests";
const SOCKET_URL = "http://192.168.40.2:8080/ws";
const PAGE_SIZE = 10;

export default function App() {
  const [requests, setRequests] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState(Date.now());

  useEffect(() => {
    fetchRequests();
    setupWebSocket();
    deleteEventsWebSocket();
    const interval = setInterval(fetchNewRequests, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // WebSocket setup
  const setupWebSocket = () => {
    const socket = new SockJS(SOCKET_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe("/topic/newRequests", (message) => {
          const newRequests: any[] = JSON.parse(message.body);
          setRequests((prevRequests) => [...newRequests, ...prevRequests]);
        });
      },
      onDisconnect: () => console.log("Disconnected from WebSocket"),
      heartbeatOutgoing: 10000,
      onStompError: (frame) => console.error("STOMP Error:", frame),
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  };

  // WebSocket setup
  const deleteEventsWebSocket = () => {
    const socket = new SockJS(SOCKET_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to deleteEventsWebSocket");
        stompClient.subscribe("/topic/deletedRequest", (message) => {
          console.log("Request to delete: ", message.body);
          const requestToBeDeletedId: String = JSON.parse(message.body);
          setRequests((prevRequests) =>
            prevRequests.filter(
              (request) => request.id !== requestToBeDeletedId
            )
          );
        });
      },
      onDisconnect: () =>
        console.log("Disconnected from deleteEventsWebSocket"),
      onStompError: (frame) => console.error("STOMP Error:", frame),
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  };

  // Fetch paginated posts for infinite scrolling
  const fetchRequests = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&size=${PAGE_SIZE}`
      );
      setRequests((prevRequests) => {
        if (
          prevRequests.some(
            (request) => request.id === response.data.content[0].id
          )
        ) {
          return prevRequests; // Skip if the new request already exists
        }

        return [...prevRequests, ...response.data.content];
      });

      // setRequests((prevRequests) => [
      //   ...prevRequests,
      //   ...response.data.content,
      // ]);
      setPage((prevPage) => prevPage + 1);
      setHasMore(!response.data.last);
      if (response.data.content.length > 0) {
        setLastTimestamp(Date.parse(response.data.content[0].createdAt));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setLoading(false);
  };

  // Polling for new posts
  const fetchNewRequests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/new?lastPostTimestamp=${lastTimestamp}`
      );
      if (response.data.length > 0) {
        setRequests((prevRequests) => {
          if (
            prevRequests.some((request) => request.id === response.data[0].id)
          ) {
            return prevRequests; // Skip if the new request already exists
          }
          return [...response.data, ...prevRequests];
        });
        setLastTimestamp(Date.now());
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
      console.log("Last timestamp:", lastTimestamp);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RequestCard request_data={item} />}
        onEndReached={fetchRequests}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
