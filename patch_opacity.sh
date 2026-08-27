sed -i '' 's/opacity={0.15}/style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}/g' apps/mobile/components/ThemedCardBackground.tsx
sed -i '' 's/style={StyleSheet.absoluteFill}//g' apps/mobile/components/ThemedCardBackground.tsx # Clean up dup
