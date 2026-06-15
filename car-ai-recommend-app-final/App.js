import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";

// 아이폰 Expo Go에서 접속할 때 사용할 컴퓨터 IP
// Expo 실행 로그에 Metro: exp://172.20.10.2:xxxx 처럼 뜨면
// 아래 IP를 172.20.10.2로 맞추면 됨
const SERVER_IP = " 10.30.131.129";

const API_URL = "https://car-ai-recommend-app-production.up.railway.app/recommend";

export default function App() {
  const [lifestyle, setLifestyle] = useState("");
  const [budget, setBudget] = useState("");
  const [carType, setCarType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleRecommend = async () => {
  if (!lifestyle || !budget || !carType) {
    setResult("라이프스타일, 예산, 선호 차종을 모두 입력해주세요.");
    return;
  }

  setLoading(true);
  setResult("");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // localtunnel 안내 페이지 때문에 막히는 경우를 줄이기 위한 헤더
        "bypass-tunnel-reminder": "true",
      },
      body: JSON.stringify({
        lifestyle,
        budget,
        carType,
      }),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(
        "서버가 JSON이 아닌 응답을 보냈습니다.\n\n" +
          responseText.slice(0, 300)
      );
    }

    if (!response.ok) {
      throw new Error(
        data.detail || data.error || "서버 오류가 발생했습니다."
      );
    }

    setResult(`${data.recommendation}\n\n사용된 AI 모델: ${data.modelUsed}`);
  } catch (error) {
    console.error(error);

    setResult(
      "AI 추천 중 오류가 발생했습니다.\n\n" +
        "오류 내용:\n" +
        `${error.message}\n\n` +
        "확인할 것:\n" +
        "1. 서버 터미널이 켜져 있는지 확인\n" +
        "2. localtunnel 터미널이 켜져 있는지 확인\n" +
        "3. App.js의 API_URL이 현재 localtunnel 주소와 같은지 확인"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI 자동차 추천 서비스</Text>

      <Text style={styles.subtitle}>
        라이프스타일, 예산, 선호 차종을 입력하면 AI가 어울리는 차량을 추천해줍니다.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>라이프스타일</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="예: 학교 통학용이고 주말에는 여자친구와 드라이브를 자주 갑니다."
          value={lifestyle}
          onChangeText={setLifestyle}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>예산</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 2,000만 원 이하 / 월 40만 원 이하 / 중고차 가능"
          value={budget}
          onChangeText={setBudget}
        />

        <Text style={styles.label}>선호 차종</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 세단 / SUV / 경차 / 전기차 / 상관없음"
          value={carType}
          onChangeText={setCarType}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleRecommend}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "AI 분석 중..." : "AI 차량 추천받기"}
          </Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>AI가 차량을 분석하는 중...</Text>
        </View>
      )}

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>추천 결과</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f6fa",
    padding: 24,
    paddingTop: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 48,
    color: "#111827",
  },
  textArea: {
    minHeight: 110,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 16,
    marginTop: 22,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  loadingBox: {
    alignItems: "center",
    marginTop: 24,
  },
  loadingText: {
    marginTop: 10,
    color: "#4b5563",
  },
  resultBox: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },
  resultText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
});