import * as Battery from "expo-battery";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TcpSocket from "react-native-tcp-socket";

export default function Index() {
  const [serverIP, setServerIP] = useState("192.168.1.100");
  const [serverPort, setServerPort] = useState("5000");
  const [battery, setBattery] = useState<number | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Pronto para enviar");
  const [socket, setSocket] = useState<any>(null);

  // Função para obter bateria
  const getBatteryLevel = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      setBattery(Math.round(level * 100));
    } catch (error) {
      console.error("Erro ao obter bateria:", error);
    }
  };

  // Função para obter localização GPS
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setStatus("Permissão de localização negada");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      setStatus("Erro ao obter localização");
    }
  };

  // Função para enviar dados via Socket TCP
  const sendStatusViaSocket = async () => {
    if (!battery || !location) {
      Alert.alert("Erro", "Bateria ou localização não disponível");
      return;
    }

    if (!serverIP || !serverPort) {
      Alert.alert("Erro", "IP e Porta do servidor são obrigatórios");
      return;
    }

    setLoading(true);
    setStatus("Conectando ao servidor...");

    try {
      const timestamp = new Date().toISOString();
      const message = `bateria:${battery};lat:${location.latitude};lon:${location.longitude};timestamp:${timestamp}`;

      console.log(`🔌 Conectando a ${serverIP}:${serverPort}`);
      console.log("📤 Mensagem:", message);

      // Criar conexão TCP Socket
      const sock = TcpSocket.createConnection(
        {
          port: parseInt(serverPort, 10),
          host: serverIP,
        },
        () => {
          console.log("✅ Conectado ao servidor!");

          // Enviar dados
          sock.write(message, "utf8", () => {
            console.log("✅ Dados enviados!");
            setStatus(
              `Enviado com sucesso!\nBateria: ${battery}%\nGPS: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
            );

            // Fechar conexão após envio
            setTimeout(() => {
              sock.destroy();
              setLoading(false);
            }, 500);
          });
        },
      );

      // Tratar erros
      sock.on("error", (error: any) => {
        console.error("❌ Erro de socket:", error);
        const errorMsg = error.message || String(error);
        setStatus(`Erro: ${errorMsg}`);
        Alert.alert(
          "Erro de Conexão",
          `Não foi possível conectar a ${serverIP}:${serverPort}\n\nErro: ${errorMsg}`,
        );
        setLoading(false);
      });

      // Fechar conexão
      sock.on("close", () => {
        console.log("Conexão fechada");
        setLoading(false);
      });

      // Timeout
      setTimeout(() => {
        if (sock) {
          sock.destroy();
        }
        setLoading(false);
      }, 10000);

      setSocket(sock);
    } catch (error: any) {
      console.error("❌ Erro ao conectar:", error);
      const errorMsg = error.message || String(error);
      setStatus(`Erro: ${errorMsg}`);
      Alert.alert("Erro", `Falha ao conectar: ${errorMsg}`);
      setLoading(false);
    }
  };

  // Inicializar bateria e localização ao montar
  useEffect(() => {
    getBatteryLevel();
    getLocation();

    // Atualizar bateria a cada 5 segundos
    const interval = setInterval(getBatteryLevel, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Im Watching You</Text>
        <Text style={styles.subtitle}>Monitoramento Pervasivo</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status do Dispositivo</Text>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Bateria:</Text>
            <Text
              style={[
                styles.value,
                { color: battery && battery < 20 ? "#ff4444" : "#4caf50" },
              ]}
            >
              {battery !== null ? `${battery}%` : "Carregando..."}
            </Text>
          </View>

          {location ? (
            <View>
              <View style={styles.statusRow}>
                <Text style={styles.label}>Latitude:</Text>
                <Text style={styles.value}>{location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.label}>Longitude:</Text>
                <Text style={styles.value}>
                  {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.loadingText}>Obtendo localização...</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuração do Servidor</Text>

          <Text style={styles.inputLabel}>IP do Servidor</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 192.168.1.100"
            value={serverIP}
            onChangeText={setServerIP}
            editable={!loading}
          />

          <Text style={styles.inputLabel}>Porta</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 5000"
            value={serverPort}
            onChangeText={setServerPort}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={sendStatusViaSocket}
            disabled={loading || !battery || !location}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar Status Agora</Text>
            )}
          </TouchableOpacity>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
});
