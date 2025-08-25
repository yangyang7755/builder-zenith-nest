import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING } from '../src/shared/constants';
import { globalStyles } from '../src/shared/styles';

export default function Settings() {
  // Status Bar Component (matching web)
  const StatusBar = () => (
    <View style={styles.statusBar}>
      <Text style={styles.statusTime}>9:41</Text>
      <View style={styles.statusIcons}>
        <View style={styles.signalBars}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[styles.signalBar, { height: 6 + i * 2 }]} />
          ))}
        </View>
        <View style={styles.batteryIcon}>
          <View style={styles.batteryBody} />
          <View style={styles.batteryTip} />
        </View>
      </View>
    </View>
  );

  const settingsItems = [
    { id: 'profile', title: 'Edit Profile', subtitle: 'Update your personal information' },
    { id: 'notifications', title: 'Notifications', subtitle: 'Manage your notification preferences' },
    { id: 'privacy', title: 'Privacy & Safety', subtitle: 'Control your privacy settings' },
    { id: 'account', title: 'Account Settings', subtitle: 'Password, email, and account options' },
    { id: 'support', title: 'Help & Support', subtitle: 'Get help and contact support' },
    { id: 'about', title: 'About', subtitle: 'App version and legal information' },
  ];

  const SettingsItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.settingsItem}>
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{item.title}</Text>
        <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.container]}>
      <StatusBar />
      
      <ScrollView style={globalStyles.flex1} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {settingsItems.slice(0, 2).map((item) => (
              <SettingsItem key={item.id} item={item} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            {settingsItems.slice(2, 4).map((item) => (
              <SettingsItem key={item.id} item={item} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            {settingsItems.slice(4).map((item) => (
              <SettingsItem key={item.id} item={item} />
            ))}
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    height: 44,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  statusTime: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signalBars: {
    flexDirection: "row",
    gap: 2,
  },
  signalBar: {
    width: 4,
    backgroundColor: COLORS.text,
    borderRadius: 1,
  },
  batteryIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryBody: {
    width: 22,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.text,
    borderRadius: 2,
  },
  batteryTip: {
    width: 2,
    height: 4,
    backgroundColor: COLORS.text,
    borderRadius: 1,
    marginLeft: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  spacer: {
    width: 24,
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "600",
  },
});
