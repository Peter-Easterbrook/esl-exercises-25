import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AboutScreen() {
  const handleWebsitePress = () => {
    Linking.openURL('https://easterbrook.at');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:esl@easterbrook.at');
  };

  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons
              name='arrow-back-circle-outline'
              size={24}
              color={colorScheme === 'dark' ? '#687076' : '#9BA1A6'}
            />
          </TouchableOpacity>
          <ThemedText type='title'>About</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/images/LL2020.png')}
              style={styles.logo}
              resizeMode='contain'
            />
            <ThemedText type='subtitle' style={styles.appName}>
              ESL Exercises
            </ThemedText>
            <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
          </View>

          {/* Company Info Section */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              About Easterbrook Language Services
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Easterbrook Language Services is a professional language education
              and translation service provider based in Austria. With years of
              experience in English language instruction, we are dedicated to
              helping non-native speakers improve their English proficiency
              through innovative learning solutions.
            </ThemedText>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Our Mission
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Our mission is to make quality English language education
              accessible to everyone. Through this mobile application, we
              provide structured, engaging exercises that help learners master
              English grammar, vocabulary, and usage at their own pace.
            </ThemedText>
          </View>

          {/* History Section */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Our History
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Founded with a passion for language education, Easterbrook
              Language Services has grown from a local tutoring service to a
              comprehensive language learning platform. Our expertise spans
              traditional classroom instruction, corporate training, and modern
              digital learning solutions.
            </ThemedText>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Our Services
            </ThemedText>
            <View style={styles.servicesList}>
              <View style={styles.serviceItem}>
                <IconSymbol
                  name='book.circle.fill'
                  size={20}
                  color='#6996b3'
                  style={styles.serviceIcon}
                />
                <ThemedText style={styles.serviceText}>
                  English Language Instruction
                </ThemedText>
              </View>
              <View style={styles.serviceItem}>
                <IconSymbol
                  name='doc.text.fill'
                  size={20}
                  color='#6996b3'
                  style={styles.serviceIcon}
                />
                <ThemedText style={styles.serviceText}>
                  Professional Translation Services
                </ThemedText>
              </View>
              <View style={styles.serviceItem}>
                <IconSymbol
                  name='person.2.fill'
                  size={20}
                  color='#6996b3'
                  style={styles.serviceIcon}
                />
                <ThemedText style={styles.serviceText}>
                  Corporate Language Training
                </ThemedText>
              </View>
              <View style={styles.serviceItem}>
                <IconSymbol
                  name='lightbulb.fill'
                  size={20}
                  color='#6996b3'
                  style={styles.serviceIcon}
                />
                <ThemedText style={styles.serviceText}>
                  Educational Technology Solutions
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Portfolio Highlights */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              What We Offer
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              <ThemedText style={styles.bold}>Structured Learning:</ThemedText>{' '}
              Carefully designed exercises covering all aspects of English
              grammar, from basic tenses to advanced usage.{'\n\n'}
              <ThemedText style={styles.bold}>
                Interactive Practice:
              </ThemedText>{' '}
              Engaging multiple-choice questions with detailed explanations to
              reinforce learning.{'\n\n'}
              <ThemedText style={styles.bold}>
                Progress Tracking:
              </ThemedText>{' '}
              Monitor your improvement with comprehensive statistics and
              achievement tracking.{'\n\n'}
              <ThemedText style={styles.bold}>
                Flexible Learning:
              </ThemedText>{' '}
              Study at your own pace, anytime, anywhere on your mobile device.
            </ThemedText>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Contact Us
            </ThemedText>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleWebsitePress}
              activeOpacity={0.7}
            >
              <IconSymbol
                name='globe'
                size={18}
                color='#6996b3'
                style={styles.contactIcon}
              />
              <ThemedText style={styles.contactText}>
                Visit easterbrook.at
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleEmailPress}
              activeOpacity={0.7}
            >
              <IconSymbol
                name='envelope.fill'
                size={18}
                color='#6996b3'
                style={styles.contactIcon}
              />
              <ThemedText style={styles.contactText}>
                esl@easterbrook.at
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              © 2025 Easterbrook Sprachdienstleistungen
            </ThemedText>
            <ThemedText style={styles.footerText}>
              All rights reserved
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    marginBottom: 8,
    color: '#000',
  },
  version: {
    fontSize: 14,
    color: '#202029',
    fontWeight: 'normal',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#000',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  bold: {
    fontWeight: '600',
    color: '#000',
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    marginRight: 12,
  },
  serviceText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#6996b3',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#202029',
    fontWeight: 'normal',
    marginBottom: 4,
  },
});
