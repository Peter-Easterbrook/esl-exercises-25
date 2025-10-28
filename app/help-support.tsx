import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HelpSupportScreen() {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@easterbrook.at');
  };

  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
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
        <ThemedText type='title'>Help & Support</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <IconSymbol
            name='questionmark.circle.fill'
            size={48}
            color='#0078ff'
          />
          <ThemedText style={styles.introText}>
            Welcome to the ESL Exercises Help Center. Find answers to common
            questions and learn how to make the most of your learning
            experience.
          </ThemedText>
        </View>

        {/* Quick Start Guide */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Quick Start Guide
          </ThemedText>
          <View style={styles.card}>
            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <ThemedText style={styles.guideNumberText}>1</ThemedText>
              </View>
              <View style={styles.guideContent}>
                <ThemedText type='defaultSemiBold' style={styles.guideTitle}>
                  Browse Exercises
                </ThemedText>
                <ThemedText style={styles.guideText}>
                  Tap on any category card to expand and view available
                  exercises. Each category contains exercises organized by
                  difficulty level.
                </ThemedText>
              </View>
            </View>

            <View style={styles.guideDivider} />

            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <ThemedText style={styles.guideNumberText}>2</ThemedText>
              </View>
              <View style={styles.guideContent}>
                <ThemedText type='defaultSemiBold' style={styles.guideTitle}>
                  Complete Exercises
                </ThemedText>
                <ThemedText style={styles.guideText}>
                  Read the instructions, answer all questions, and submit when
                  ready. Your score is calculated based on correct answers.
                </ThemedText>
              </View>
            </View>

            <View style={styles.guideDivider} />

            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <ThemedText style={styles.guideNumberText}>3</ThemedText>
              </View>
              <View style={styles.guideContent}>
                <ThemedText type='defaultSemiBold' style={styles.guideTitle}>
                  Track Progress
                </ThemedText>
                <ThemedText style={styles.guideText}>
                  Visit the Progress tab to see your statistics, completion
                  rates, and learning streaks across all categories.
                </ThemedText>
              </View>
            </View>

            <View style={styles.guideDivider} />

            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <ThemedText style={styles.guideNumberText}>4</ThemedText>
              </View>
              <View style={styles.guideContent}>
                <ThemedText type='defaultSemiBold' style={styles.guideTitle}>
                  Download Materials
                </ThemedText>
                <ThemedText style={styles.guideText}>
                  Look for downloadable files in expanded categories. Tap to
                  download PDF or DOC files for offline study.
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Frequently Asked Questions
          </ThemedText>
          <View style={styles.card}>
            <Collapsible title='How do I change my password?'>
              <ThemedText style={styles.faqAnswer}>
                Go to Profile → Account Settings → Change Password. You will
                need to enter your current password, then your new password
                twice for confirmation.
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='How is my score calculated?'>
              <ThemedText style={styles.faqAnswer}>
                Your score is the percentage of correct answers. For example, if
                you answer 8 out of 10 questions correctly, your score is 80%.
                Get 100% to see a special celebration!
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='Can I retake exercises?'>
              <ThemedText style={styles.faqAnswer}>
                Yes! You can retake any exercise as many times as you would
                like. Your highest score and most recent completion will be
                saved to your progress.
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='How do I download exercise materials?'>
              <ThemedText style={styles.faqAnswer}>
                Expand a category card by tapping on it. If downloadable files
                are available, you will see them listed with a download icon.
                Tap to open the sharing dialog and save the file to your device.
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='What do the difficulty levels mean?'>
              <ThemedText style={styles.faqAnswer}>
                • Beginner: Basic concepts, simple vocabulary, fundamental
                grammar{'\n'}• Intermediate: More complex structures, expanded
                vocabulary{'\n'}• Advanced: Complex grammar, idioms, nuanced
                language usage
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='How do I delete my progress?'>
              <ThemedText style={styles.faqAnswer}>
                Go to Profile → Account Settings → scroll to the Danger Zone
                section. You can delete just your progress data (keeping your
                account) or delete your entire account permanently.
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='Is my data private and secure?'>
              <ThemedText style={styles.faqAnswer}>
                Yes! All your data is securely stored in Firebase with
                industry-standard encryption. We comply with GDPR and CCPA
                regulations. You can export or delete your data anytime. See our
                Privacy Policy for details.
              </ThemedText>
            </Collapsible>

            <View style={styles.faqDivider} />

            <Collapsible title='Can I use the app offline?'>
              <ThemedText style={styles.faqAnswer}>
                Currently, the app requires an internet connection to load
                exercises and save your progress. Offline mode is planned for a
                future update.
              </ThemedText>
            </Collapsible>
          </View>
        </View>

        {/* Troubleshooting Section */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Troubleshooting
          </ThemedText>
          <View style={styles.card}>
            <View style={styles.troubleshootItem}>
              <IconSymbol
                name='exclamationmark.triangle'
                size={24}
                color='#ff9500'
              />
              <View style={styles.troubleshootContent}>
                <ThemedText
                  type='defaultSemiBold'
                  style={styles.troubleshootTitle}
                >
                  Exercises won't load
                </ThemedText>
                <ThemedText style={styles.troubleshootText}>
                  • Check your internet connection{'\n'}• Pull down on the
                  screen to refresh{'\n'}• Try logging out and back in{'\n'}•
                  Restart the app
                </ThemedText>
              </View>
            </View>

            <View style={styles.guideDivider} />

            <View style={styles.troubleshootItem}>
              <IconSymbol name='lock.fill' size={24} color='#ff9500' />
              <View style={styles.troubleshootContent}>
                <ThemedText
                  type='defaultSemiBold'
                  style={styles.troubleshootTitle}
                >
                  Can't log in
                </ThemedText>
                <ThemedText style={styles.troubleshootText}>
                  • Double-check your email and password{'\n'}• Ensure your
                  internet connection is stable{'\n'}• Try resetting your
                  password{'\n'}• Contact support if the issue persists
                </ThemedText>
              </View>
            </View>

            <View style={styles.guideDivider} />

            <View style={styles.troubleshootItem}>
              <IconSymbol name='arrow.down.circle' size={24} color='#ff9500' />
              <View style={styles.troubleshootContent}>
                <ThemedText
                  type='defaultSemiBold'
                  style={styles.troubleshootTitle}
                >
                  Files won't download
                </ThemedText>
                <ThemedText style={styles.troubleshootText}>
                  • Check your internet connection{'\n'}• Ensure you have
                  storage space available{'\n'}• Check app permissions for file
                  access{'\n'}• Try downloading a different file first
                </ThemedText>
              </View>
            </View>

            <View style={styles.guideDivider} />

            <View style={styles.troubleshootItem}>
              <IconSymbol
                name='externaldrive.badge.xmark'
                size={24}
                color='#ff9500'
              />
              <View style={styles.troubleshootContent}>
                <ThemedText
                  type='defaultSemiBold'
                  style={styles.troubleshootTitle}
                >
                  Progress not saving
                </ThemedText>
                <ThemedText style={styles.troubleshootText}>
                  • Ensure you're connected to the internet{'\n'}• Complete the
                  entire exercise before closing{'\n'}• Check the Progress tab
                  to verify{'\n'}• Try completing a different exercise to test
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Still Need Help?
          </ThemedText>
          <View style={styles.contactCard}>
            <IconSymbol name='envelope.fill' size={32} color='#0078ff' />
            <ThemedText style={styles.contactText}>
              If you are experiencing technical issues with the app that are not
              resolved by the information above, please contact our support
              team.
            </ThemedText>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailSupport}
            >
              <IconSymbol name='paperplane.fill' size={18} color='#fff' />
              <ThemedText style={styles.emailButtonText}>
                Email Support
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.emailText}>
              support@easterbrook.at
            </ThemedText>
            <ThemedText style={styles.responseText}>
              We typically respond within 1-2 business days.
            </ThemedText>
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Additional Resources
          </ThemedText>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => router.push('/about')}
            >
              <IconSymbol name='info.circle' size={24} color='#0078ff' />
              <View style={styles.resourceContent}>
                <ThemedText type='defaultSemiBold'>About Us</ThemedText>
                <ThemedText style={styles.resourceSubtext}>
                  Learn about Easterbrook Language Services
                </ThemedText>
              </View>
              <IconSymbol name='chevron.right' size={16} color='#999' />
            </TouchableOpacity>

            <View style={styles.guideDivider} />

            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => router.push('/privacy-policy' as any)}
            >
              <IconSymbol name='doc.text' size={24} color='#0078ff' />
              <View style={styles.resourceContent}>
                <ThemedText type='defaultSemiBold'>Privacy Policy</ThemedText>
                <ThemedText style={styles.resourceSubtext}>
                  How we protect your data
                </ThemedText>
              </View>
              <IconSymbol name='chevron.right' size={16} color='#999' />
            </TouchableOpacity>

            <View style={styles.guideDivider} />

            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => router.push('/account-settings')}
            >
              <IconSymbol name='gearshape' size={24} color='#0078ff' />
              <View style={styles.resourceContent}>
                <ThemedText type='defaultSemiBold'>Account Settings</ThemedText>
                <ThemedText style={styles.resourceSubtext}>
                  Manage your profile and data
                </ThemedText>
              </View>
              <IconSymbol name='chevron.right' size={16} color='#999' />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  introText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  contactCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0e8ff',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  guideNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0078ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },
  guideText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  guideDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginTop: 8,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  troubleshootItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  troubleshootContent: {
    flex: 1,
  },
  troubleshootTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
  },
  troubleshootText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  contactText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0078ff',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
    color: '#0078ff',
    fontWeight: '600',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
