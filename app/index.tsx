import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  Animated,
  Image,
  Easing,
} from "react-native";
import { Video, ResizeMode, Audio } from "expo-av";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import Svg, { Circle, Path } from "react-native-svg";


const TopTextSvg = () => (
  <Svg width="176" height="70" viewBox="0 0 176 70">
    <Path
      d="M 0 0 L 24 0 L 6 70 M 42 0 L 42 70 M 66 0 L 90 0 L 90 35 L 66 35 L 66 70 L 90 70 M 112 0 L 112 70 M 136 0 L 136 70 M 152 0 L 176 0 L 152 70 L 176 70"
      stroke="#F0F0F0"
      strokeWidth="6"
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </Svg>
);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MAX_DURATION_SEC = 90;
const MAX_DURATION_MS = MAX_DURATION_SEC * 1000;
const CIRCLE_SIZE = 80;
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function RecordButton({ isRecording, onPress }) {
  const progress = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.timing(progress, {
        toValue: 1,
        duration: MAX_DURATION_MS,
        useNativeDriver: false,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      progress.setValue(0);
      blinkAnim.setValue(0);
      blinkAnim.stopAnimation();
    }
  }, [isRecording]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.recordButtonContainer}
      activeOpacity={0.8}
    >
      <Svg
        width={CIRCLE_SIZE}
        height={CIRCLE_SIZE}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        <AnimatedCircle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="red"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.recordInnerIconContainer}>
        <Image
          source={require("../assets/images/record-button.png")}
          style={styles.recordInnerIcon}
          resizeMode="contain"
        />
        <Animated.Image
          source={require("../assets/images/record-button.png")}
          style={[
            styles.recordInnerIcon,
            { position: "absolute", tintColor: "white", opacity: blinkAnim },
          ]}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

function CountdownTimer({ onComplete }) {
  // Use a smaller TOTAL_SECONDS to test, e.g., const TOTAL_SECONDS = 60;
  const TOTAL_SECONDS = 24 * 60 * 60;
  // const TOTAL_SECONDS = 30;

  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {


    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: TOTAL_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, []);

  const TIMER_CIRCLE_SIZE = 300;
  const PIE_RADIUS = 65;
  const PIE_STROKE_WIDTH = 130;
  const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PIE_CIRCUMFERENCE, 0],
  });

  const hours = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  const pad = (n) => n.toString().padStart(2, "0");

  const currentAngle = (1 - timeLeft / TOTAL_SECONDS) * 360;

  const dots = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * 360;
    // Turn red if passed. The top dot (angle 0) turns red at the very end.
    const isRed = (angle <= currentAngle && angle > 0) || currentAngle >= 360;
    return (
      <View
        key={i}
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          backgroundColor: isRed ? "#F81D20" : "#FFFFFF",
          top: "50%",
          left: "50%",
          marginTop: -5,
          marginLeft: -5,
          transform: [{ rotate: `${angle}deg` }, { translateY: -150 }],
        }}
      />
    );
  });

  return (
    <View style={styles.timerScreen}>
      <View style={styles.clockContainer}>
        {dots}
        <Svg
          width={TIMER_CIRCLE_SIZE}
          height={TIMER_CIRCLE_SIZE}
          style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
        >
          <AnimatedCircle
            cx={TIMER_CIRCLE_SIZE / 2}
            cy={TIMER_CIRCLE_SIZE / 2}
            r={PIE_RADIUS}
            stroke="#F81D20"
            strokeWidth={PIE_STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={PIE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
          />
        </Svg>
        <Text
          style={styles.timerText}
        >{`${pad(hours)}:${pad(mins)}:${pad(secs)}`}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [phase, setPhase] = useState("opening"); // "opening" | "camera" | "ending" | "timer" | "final"
  const [loops, setLoops] = useState(0);

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const endVideoRef = useRef(null);
  const finalVideoRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const bottomTextOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase === "opening") {
      bottomTextOpacity.setValue(1);
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(bottomTextOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phase, bottomTextOpacity]);

  useEffect(() => {
    let currentSound = null;
    let isUnmounted = false;

    const playMusic = async () => {
      if (phase === "ending") {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("../assets/bg-music.mp3"),
          { shouldPlay: true },
        );
        currentSound = newSound;
        setSound(currentSound);

        newSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish && !isUnmounted) {
            setTimeout(async () => {
              if (!isUnmounted && currentSound) {
                await currentSound.replayAsync();
              }
            }, 500); // 500ms half second gap
          }
        });
      }
    };

    const stopMusic = async () => {
      isUnmounted = true;
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        currentSound = null;
        setSound(null);
      }
    };

    if (phase === "ending") {
      playMusic();
    } else {
      stopMusic();
    }

    return () => {
      stopMusic();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "camera") {
      if (permission && !permission.granted && permission.canAskAgain) {
        requestPermission();
      }
      if (
        micPermission &&
        !micPermission.granted &&
        micPermission.canAskAgain
      ) {
        requestMicPermission();
      }
    }
  }, [phase, permission, micPermission]);

  const handleOpeningStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setLoops((prev) => {
        const newLoops = prev + 1;
        if (newLoops >= 2) {
          setPhase("camera");
          return 0;
        } else {
          videoRef.current?.replayAsync();
          return newLoops;
        }
      });
    }
  };

  const handleEndingStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setLoops((prev) => {
        const newLoops = prev + 1;
        if (newLoops >= 2) {
          setPhase("timer");
          return 0;
        } else {
          endVideoRef.current?.replayAsync();
          return newLoops;
        }
      });
    }
  };

  const handleFinalStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setLoops((prev) => {
        const newLoops = prev + 1;
        if (newLoops >= 3) {
          setPhase("opening");
          return 0;
        } else {
          finalVideoRef.current?.replayAsync();
          return newLoops;
        }
      });
    }
  };

  const handleRecordPress = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      setPhase("ending");
    } else {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: MAX_DURATION_SEC,
        });
        console.log("Recorded video:", video?.uri);
        if (isRecording) {
          setIsRecording(false);
          setPhase("ending");
        }
      } catch (e) {
        console.error("Recording error:", e);
        setIsRecording(false);
      }
    }
  };

  if (phase === "timer") {
    return <CountdownTimer onComplete={() => setPhase("final")} />;
  }

  if (phase === "final") {
    return (
      <View style={styles.screen}>
        <Video
          ref={finalVideoRef}
          source={require("../assets/final.mp4")}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={handleFinalStatusUpdate}
        />
      </View>
    );
  }

  if (phase === "camera") {
    if (!permission || !micPermission) {
      return <View style={styles.screen} />;
    }

    if (!permission.granted || !micPermission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            We need camera and microphone permissions
          </Text>
          <Button
            onPress={() => {
              if (!permission.granted) requestPermission();
              if (!micPermission.granted) requestMicPermission();
            }}
            title="Grant Permissions"
          />
        </View>
      );
    }

    return (
      <View style={styles.screen}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="front"
          mode="video"
        />
        <View style={styles.bottomControls}>
          <RecordButton isRecording={isRecording} onPress={handleRecordPress} />
        </View>
      </View>
    );
  }

  if (phase === "ending") {
    return (
      <View style={styles.screen}>
        <Video
          ref={endVideoRef}
          source={require("../assets/end.mp4")}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={handleEndingStatusUpdate}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Video
        ref={videoRef}
        source={require("../assets/girigo-opening.mp4")}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handleOpeningStatusUpdate}
      />
      <View style={styles.openingTextOverlay} pointerEvents="none">
        <TopTextSvg />
        <Animated.Text
          style={[styles.bottomText, { opacity: bottomTextOpacity }]}
        >
          견불기
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  permissionText: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  bottomControls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
  recordButtonContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  recordInnerIconContainer: {
    width: CIRCLE_SIZE - 20,
    height: CIRCLE_SIZE - 20,
    justifyContent: "center",
    alignItems: "center",
  },
  recordInnerIcon: {
    width: "100%",
    height: "100%",
  },
  timerScreen: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  clockContainer: {
    width: 320,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },
  needleContainer: {
    position: "absolute",
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  needle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 120,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#F81D20",
    marginTop: 40,
  },
  timerText: {
    position: "absolute",
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "500",
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  openingTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 100,
  },
  topText: {
    color: "#FFF",
    fontSize: 60,
    fontWeight: "300",
    letterSpacing: 4,
  },
  bottomText: {
    color: "#FFF",
    fontSize: 50,
    fontWeight: "300",
    letterSpacing: 4,
  },
});
