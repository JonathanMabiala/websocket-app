import { StyleSheet, Text, View } from "react-native";
import React from "react";

const RequestCard = ({ request_data }: any) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{request_data.issue}</Text>
      <Text style={styles.description}>{request_data.description}</Text>
      <Text style={styles.budget}>
        Budget: ${request_data.budget} ({request_data.budgetOption})
      </Text>
      <Text style={styles.status}>Status: {request_data.status}</Text>
      <View style={styles.profile}>
        <Text style={styles.profileName}>
          Requested by: {request_data.profile.fullName}
        </Text>
        <Text style={styles.profileProfession}>
          Profession: {request_data.profile.profession}
        </Text>
      </View>
      <View style={styles.address}>
        <Text style={styles.addressTitle}>Address:</Text>
        <Text>
          {request_data.address.streetNumber} {request_data.address.street},{" "}
          {request_data.address.city}, {request_data.address.region},{" "}
          {request_data.address.country}
        </Text>
      </View>
    </View>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginVertical: 10,
  },
  budget: {
    fontSize: 14,
    marginVertical: 5,
  },
  status: {
    fontSize: 14,
    marginVertical: 5,
  },
  profile: {
    marginVertical: 10,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  profileProfession: {
    fontSize: 14,
  },
  address: {
    marginVertical: 10,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
