import { useEffect, useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const SPLASH_MS = 3000;

type Props = {
  visible: boolean;
  onFinish: () => void;
};

function PixelFigure() {
  const cell = 7;
  const rows = 26;
  const cols = 18;
  const blocks: { c: number; r: number; o: number }[] = [];

  for (let r = 0; r < rows; r++) {
    const flare = Math.min(5, Math.floor(r / 4));
    const leftLo = 3 - flare;
    const leftHi = 6 + flare;
    const rightLo = cols - 7 - flare;
    const rightHi = cols - 4 + flare;
    for (let c = 0; c < cols; c++) {
      const leftLeg = c >= leftLo && c <= leftHi && r < rows - 2;
      const rightLeg = c >= rightLo && c <= rightHi && r < rows - 2;
      const gap = c > leftHi && c < rightLo;
      if (gap) continue;
      if (leftLeg || rightLeg) {
        const edge =
          c === leftLo || c === leftHi || c === rightLo || c === rightHi || r === 0 || r === rows - 3
            ? 0.78
            : 0.92;
        blocks.push({ c, r, o: edge + (r % 3) * 0.02 });
      }
    }
  }

  return (
    <View style={{ width: cols * cell, height: rows * cell }}>
      {blocks.map((b, i) => (
        <View
          key={i}
          style={[
            styles.pixel,
            {
              left: b.c * cell,
              top: b.r * cell,
              width: cell - 1,
              height: cell - 1,
              opacity: b.o,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function HomeSplashOverlay({ visible, onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onFinishRef.current(), SPLASH_MS);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent transparent={false}>
      <StatusBar style="light" />
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.center}>
          <PixelFigure />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pixel: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
