import 'package:flutter/material.dart';

class AppTheme {
  static const Color midnightBlue = Color(0xFF0a0a1a);
  static const Color neonCyan = Color(0xFF00f0ff);
  static const Color neonPurple = Color(0xFFa855f7);
  static const Color darkCard = Color(0xFF111128);
  static const Color whiteText = Color(0xFFFFFFFF);
  static const Color greyText = Color(0xFF9CA3AF);
  static const Color neonGreen = Color(0xFF22C55E);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColorDark: midnightBlue,
      scaffoldBackgroundColor: midnightBlue,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: neonPurple,
        surface: darkCard,
        onPrimary: midnightBlue,
        onSecondary: Colors.white,
        onSurface: whiteText,
      ),
      cardColor: darkCard,
      textTheme: const TextTheme(
        headlineLarge: TextStyle(color: whiteText, fontWeight: FontWeight.bold, fontSize: 28),
        headlineMedium: TextStyle(color: whiteText, fontWeight: FontWeight.bold, fontSize: 22),
        headlineSmall: TextStyle(color: whiteText, fontWeight: FontWeight.w600, fontSize: 18),
        bodyLarge: TextStyle(color: whiteText, fontSize: 16),
        bodyMedium: TextStyle(color: greyText, fontSize: 14),
        bodySmall: TextStyle(color: greyText, fontSize: 12),
        labelLarge: TextStyle(color: whiteText, fontWeight: FontWeight.w600, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: midnightBlue,
          backgroundColor: neonCyan,
          side: const BorderSide(color: neonCyan, width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: neonPurple,
          side: const BorderSide(color: neonPurple, width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkCard,
        hintStyle: const TextStyle(color: greyText),
        labelStyle: const TextStyle(color: greyText),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: neonCyan, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: neonCyan, width: 2),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: greyText, width: 1),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      dividerColor: neonCyan.withOpacity(0.2),
      appBarTheme: const AppBarTheme(
        backgroundColor: midnightBlue,
        foregroundColor: whiteText,
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: neonCyan,
        foregroundColor: midnightBlue,
      ),
    );
  }
}
