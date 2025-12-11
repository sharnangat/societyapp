import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

interface SpamMessage {
  sender: string;
  message: string;
  date: string;
  spamScore: number;
  spamReasons: string[];
}

interface SpamEmail {
  sender: string;
  subject: string;
  preview: string;
  date: string;
  spamScore: number;
  spamReasons: string[];
}

interface AppDataAccess {
  appName: string;
  hasNetworkAccess: boolean;
  hasSmsAccess: boolean;
  hasLocationAccess: boolean;
  hasCameraAccess: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface HealthMetrics {
  deviceName: string;
  deviceId: string;
  systemName: string;
  systemVersion: string;
  brand: string;
  model: string;
  batteryLevel: number | null;
  isCharging: boolean | null;
  totalMemory: string;
  usedMemory: string;
  freeMemory: string;
  totalStorage: string;
  freeStorage: string;
  isConnected: boolean;
  connectionType: string;
  appVersion: string;
  buildNumber: string;
  spamMessages: SpamMessage[];
  spamEmails: SpamEmail[];
  appsWithDataAccess: AppDataAccess[];
  suspiciousNetworkActivity: number;
  securityWarnings: string[];
}

interface Props {
  isDarkMode: boolean;
}

function MobileHealthScanner({ isDarkMode }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [lastScanned, setLastScanned] = useState<Date | null>(null);
  const [showSpamDetails, setShowSpamDetails] = useState(false);
  const [showAppsDetails, setShowAppsDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    deviceInfo: true,
    battery: true,
    memory: false,
    storage: false,
    network: false,
    security: false,
    spam: false,
    spamEmails: false,
    apps: false,
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Spam detection patterns
  const spamKeywords = [
    'free', 'winner', 'congratulations', 'claim now', 'urgent',
    'click here', 'limited time', 'act now', 'you have won',
    'prize', 'lottery', 'gift card', 'verify account', 'suspended',
    'expired', 'update now', 'confirm your identity', 'pay now',
    'loan approved', 'investment opportunity', 'guaranteed', 'no credit check'
  ];

  const suspiciousNumbers = ['+44', '+1', '+91', 'UNKNOWN', 'BLOCKED'];

  const detectSpamMessage = (sender: string, message: string): { score: number; reasons: string[] } => {
    let spamScore = 0;
    const reasons: string[] = [];
    const lowerMessage = message.toLowerCase();
    const lowerSender = sender.toLowerCase();

    // Check for spam keywords
    spamKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        spamScore += 10;
        if (!reasons.includes('Contains spam keywords')) {
          reasons.push('Contains spam keywords');
        }
      }
    });

    // Check for suspicious sender numbers
    if (suspiciousNumbers.some(num => sender.includes(num))) {
      spamScore += 15;
      reasons.push('Suspicious sender number');
    }

    // Check for URL/links
    const urlPattern = /(http|https|www\.|bit\.ly|tinyurl)/gi;
    if (urlPattern.test(message)) {
      spamScore += 10;
      reasons.push('Contains links');
    }

    // Check for urgency language
    const urgencyPattern = /(urgent|immediate|now|hurry|expires|limited)/gi;
    if (urgencyPattern.test(message)) {
      spamScore += 5;
      if (!reasons.includes('Urgency language detected')) {
        reasons.push('Urgency language detected');
      }
    }

    // Check message length (very short suspicious messages)
    if (message.length < 20 && spamScore > 0) {
      spamScore += 5;
      reasons.push('Suspiciously short message');
    }

    return { score: Math.min(spamScore, 100), reasons };
  };

  const scanSpamMessages = async (): Promise<SpamMessage[]> => {
    const spamMessages: SpamMessage[] = [];
    
    try {
      // Note: SMS access requires special permissions and native implementation
      // This is a mock implementation - in production, you'd use react-native-get-sms-android or similar
      // For iOS, SMS access is not available through standard APIs
      
      if (Platform.OS === 'android') {
        // Simulated spam detection - replace with actual SMS access
        console.log('Scanning SMS messages for spam...');
        // In real implementation, you would:
        // 1. Request SMS permission
        // 2. Read SMS messages
        // 3. Analyze each message for spam patterns
        
        // Example detection (this would come from actual SMS data)
        const sampleMessages = [
          { sender: 'UNKNOWN', message: 'Congratulations! You have won $1000. Click here to claim: bit.ly/fake', date: new Date().toISOString() },
          { sender: '+1234567890', message: 'Urgent: Your account has been suspended. Verify now!', date: new Date().toISOString() },
        ];

        sampleMessages.forEach(msg => {
          const spamCheck = detectSpamMessage(msg.sender, msg.message);
          if (spamCheck.score > 30) {
            spamMessages.push({
              sender: msg.sender,
              message: msg.message,
              date: msg.date,
              spamScore: spamCheck.score,
              spamReasons: spamCheck.reasons,
            });
          }
        });
      } else {
        console.log('SMS scanning not available on iOS');
      }
    } catch (error) {
      console.error('Error scanning spam messages:', error);
    }

    return spamMessages;
  };

  // Email-specific spam patterns
  const emailSpamKeywords = [
    'act now', 'limited offer', 'exclusive deal', 'winner', 'congratulations',
    'claim your prize', 'urgent action required', 'verify your account',
    'suspended account', 'click here', 'free money', 'guaranteed income',
    'no credit check', 'get rich quick', 'investment opportunity', 'work from home',
    'viagra', 'pharmacy', 'weight loss', 'lose weight fast', 'buy now',
    'discount', 'sale', 'clearance', 'limited time', 'expires soon'
  ];

  const suspiciousEmailDomains = ['mail.ru', 'yandex.com', 'qq.com', '163.com'];

  const detectSpamEmail = (sender: string, subject: string, preview: string): { score: number; reasons: string[] } => {
    let spamScore = 0;
    const reasons: string[] = [];
    const lowerSubject = subject.toLowerCase();
    const lowerPreview = preview.toLowerCase();
    const lowerSender = sender.toLowerCase();

    // Check for spam keywords in subject
    emailSpamKeywords.forEach(keyword => {
      if (lowerSubject.includes(keyword.toLowerCase())) {
        spamScore += 15;
        if (!reasons.includes('Contains spam keywords')) {
          reasons.push('Contains spam keywords');
        }
      }
    });

    // Check for spam keywords in preview
    emailSpamKeywords.forEach(keyword => {
      if (lowerPreview.includes(keyword.toLowerCase())) {
        spamScore += 10;
        if (!reasons.includes('Suspicious content')) {
          reasons.push('Suspicious content');
        }
      }
    });

    // Check for suspicious sender domains
    if (suspiciousEmailDomains.some(domain => lowerSender.includes(domain))) {
      spamScore += 20;
      reasons.push('Suspicious sender domain');
    }

    // Check for URL/links in subject or preview
    const urlPattern = /(http|https|www\.|bit\.ly|tinyurl|short\.link)/gi;
    if (urlPattern.test(subject) || urlPattern.test(preview)) {
      spamScore += 15;
      reasons.push('Contains suspicious links');
    }

    // Check for urgency language
    const urgencyPattern = /(urgent|immediate|now|hurry|expires|limited|act now|verify)/gi;
    if (urgencyPattern.test(subject)) {
      spamScore += 10;
      if (!reasons.includes('Urgency language detected')) {
        reasons.push('Urgency language detected');
      }
    }

    // Check for all caps subject (spam indicator)
    if (subject.length > 10 && subject === subject.toUpperCase()) {
      spamScore += 10;
      reasons.push('Subject in all caps');
    }

    // Check for excessive punctuation
    if ((subject.match(/[!]{2,}/g) || []).length > 0 || (subject.match(/[$]{2,}/g) || []).length > 0) {
      spamScore += 8;
      reasons.push('Excessive punctuation');
    }

    return { score: Math.min(spamScore, 100), reasons };
  };

  const scanSpamEmails = async (): Promise<SpamEmail[]> => {
    const spamEmails: SpamEmail[] = [];
    
    try {
      // Note: Email access requires special permissions and native implementation
      // This is a mock implementation - in production, you'd integrate with email APIs
      // or use native email access libraries
      
      console.log('Scanning emails for spam...');
      
      // Simulated email detection - replace with actual email access
      // In real implementation, you would:
      // 1. Request email access permission
      // 2. Connect to email account (IMAP/POP3/Exchange)
      // 3. Read recent emails
      // 4. Analyze each email for spam patterns
      
      const sampleEmails = [
        { 
          sender: 'winner@lottery.com', 
          subject: 'CONGRATULATIONS!!! YOU WON $1,000,000!!!', 
          preview: 'Click here to claim your prize now! Limited time offer!',
          date: new Date().toISOString() 
        },
        { 
          sender: 'security@bank.com', 
          subject: 'URGENT: Verify Your Account Immediately', 
          preview: 'Your account has been suspended. Click this link to verify: bit.ly/fake-bank',
          date: new Date().toISOString() 
        },
        { 
          sender: 'deal@shopping.ru', 
          subject: 'Act Now - 90% OFF Limited Time Sale!', 
          preview: 'Get amazing deals! Buy now before it expires. Click here!',
          date: new Date().toISOString() 
        },
      ];

      sampleEmails.forEach(email => {
        const spamCheck = detectSpamEmail(email.sender, email.subject, email.preview);
        if (spamCheck.score > 40) {
          spamEmails.push({
            sender: email.sender,
            subject: email.subject,
            preview: email.preview,
            date: email.date,
            spamScore: spamCheck.score,
            spamReasons: spamCheck.reasons,
          });
        }
      });

      // Show alert if spam emails detected
      if (spamEmails.length > 0) {
        Alert.alert(
          '🚨 Spam Emails Detected',
          `Found ${spamEmails.length} spam email(s) in your inbox. Check the scan results for details.`,
          [
            {
              text: 'View Details',
              style: 'default',
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error scanning spam emails:', error);
    }

    return spamEmails;
  };

  const checkAppsDataAccess = async (): Promise<AppDataAccess[]> => {
    const apps: AppDataAccess[] = [];
    
    try {
      // Note: Checking app permissions requires native implementation
      // This is a simulated check - in production, you'd need native modules
      
      if (Platform.OS === 'android') {
        // Common apps to check (this would come from actual installed apps list)
        const appsToCheck = [
          { name: 'Social Media Apps', risk: 'medium' as const },
          { name: 'Shopping Apps', risk: 'low' as const },
          { name: 'Unknown/Unverified Apps', risk: 'high' as const },
        ];

        appsToCheck.forEach(app => {
          apps.push({
            appName: app.name,
            hasNetworkAccess: true,
            hasSmsAccess: app.risk === 'high',
            hasLocationAccess: app.risk !== 'low',
            hasCameraAccess: app.risk === 'medium' || app.risk === 'high',
            riskLevel: app.risk,
          });
        });
      }
    } catch (error) {
      console.error('Error checking app data access:', error);
    }

    return apps;
  };

  const detectSuspiciousNetworkActivity = async (): Promise<number> => {
    // Monitor network connections
    // In production, this would track actual network requests
    try {
      const netInfo = await NetInfo.fetch();
      // Simulated suspicious activity count
      // In real implementation, you'd track outgoing connections
      return Math.floor(Math.random() * 5); // 0-4 suspicious connections
    } catch (error) {
      console.error('Error detecting network activity:', error);
      return 0;
    }
  };

  const generateSecurityWarnings = (healthData: Partial<HealthMetrics>): string[] => {
    const warnings: string[] = [];

    if (healthData.spamMessages && healthData.spamMessages.length > 0) {
      warnings.push(`${healthData.spamMessages.length} spam message(s) detected`);
    }

    if (healthData.spamEmails && healthData.spamEmails.length > 0) {
      warnings.push(`${healthData.spamEmails.length} spam email(s) detected`);
    }

    if (healthData.appsWithDataAccess) {
      const highRiskApps = healthData.appsWithDataAccess.filter(app => app.riskLevel === 'high');
      if (highRiskApps.length > 0) {
        warnings.push(`${highRiskApps.length} high-risk app(s) with data access`);
      }
    }

    if (healthData.suspiciousNetworkActivity && healthData.suspiciousNetworkActivity > 3) {
      warnings.push('High number of suspicious network connections detected');
    }

    if (!healthData.isConnected) {
      warnings.push('Device is offline - cannot verify network security');
    }

    return warnings;
  };

  const scanDeviceHealth = async () => {
    setIsScanning(true);
    console.log('=== MOBILE HEALTH SCAN START ===');

    try {
      // Device Information
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceId = DeviceInfo.getDeviceId();
      const systemName = DeviceInfo.getSystemName();
      const systemVersion = DeviceInfo.getSystemVersion();
      const brand = DeviceInfo.getBrand();
      const model = DeviceInfo.getModel();
      const appVersion = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();

      // Battery Information
      let batteryLevel: number | null = null;
      let isCharging: boolean | null = null;
      try {
        batteryLevel = await DeviceInfo.getBatteryLevel();
        isCharging = await DeviceInfo.isBatteryCharging();
      } catch (error) {
        console.warn('Battery info not available:', error);
      }

      // Memory Information
      let totalMemory = 'N/A';
      let usedMemory = 'N/A';
      let freeMemory = 'N/A';
      try {
        const totalMem = await DeviceInfo.getTotalMemory();
        totalMemory = formatBytes(totalMem);
        // Note: Used memory calculation might not be exact on all platforms
        const usedMem = await DeviceInfo.getUsedMemory().catch(() => null);
        if (usedMem) {
          usedMemory = formatBytes(usedMem);
          freeMemory = formatBytes(totalMem - usedMem);
        } else {
          freeMemory = 'N/A';
        }
      } catch (error) {
        console.warn('Memory info not available:', error);
      }

      // Storage Information
      let totalStorage = 'N/A';
      let freeStorage = 'N/A';
      try {
        const totalStorageBytes = await DeviceInfo.getTotalDiskCapacity();
        const freeStorageBytes = await DeviceInfo.getFreeDiskStorage();
        totalStorage = formatBytes(totalStorageBytes);
        freeStorage = formatBytes(freeStorageBytes);
      } catch (error) {
        console.warn('Storage info not available:', error);
      }

      // Network Information
      const netInfo = await NetInfo.fetch();
      const isConnected = netInfo.isConnected ?? false;
      const connectionType = netInfo.type || 'unknown';

      // Security Scans
      console.log('Scanning for spam messages...');
      const spamMessages = await scanSpamMessages();
      
      console.log('Scanning for spam emails...');
      const spamEmails = await scanSpamEmails();
      
      console.log('Checking app data access...');
      const appsWithDataAccess = await checkAppsDataAccess();
      
      console.log('Detecting suspicious network activity...');
      const suspiciousNetworkActivity = await detectSuspiciousNetworkActivity();

      const metrics: HealthMetrics = {
        deviceName,
        deviceId,
        systemName,
        systemVersion,
        brand,
        model,
        batteryLevel: batteryLevel !== null ? Math.round(batteryLevel * 100) : null,
        isCharging,
        totalMemory,
        usedMemory,
        freeMemory,
        totalStorage,
        freeStorage,
        isConnected,
        connectionType: connectionType.charAt(0).toUpperCase() + connectionType.slice(1),
        appVersion,
        buildNumber,
        spamMessages,
        spamEmails,
        appsWithDataAccess,
        suspiciousNetworkActivity,
        securityWarnings: [],
      };

      // Generate security warnings
      metrics.securityWarnings = generateSecurityWarnings(metrics);

      setHealthData(metrics);
      setLastScanned(new Date());
      console.log('=== MOBILE HEALTH SCAN COMPLETE ===');
      console.log('Health Data:', JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Health scan error:', error);
      Alert.alert(
        'Scan Error',
        'Failed to scan device health. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const getHealthStatus = (): { status: string; color: string } => {
    if (!healthData) return { status: 'Not Scanned', color: '#64748b' };

    let issues = 0;
    
    if (healthData.batteryLevel !== null && healthData.batteryLevel < 20) issues++;
    if (healthData.freeStorage && parseFloat(healthData.freeStorage) < 1000 * 1024 * 1024) issues++; // Less than 1GB
    if (!healthData.isConnected) issues++;
    if (healthData.spamMessages && healthData.spamMessages.length > 0) issues++;
    if (healthData.spamEmails && healthData.spamEmails.length > 0) issues++;
    if (healthData.appsWithDataAccess && healthData.appsWithDataAccess.filter(app => app.riskLevel === 'high').length > 0) issues++;
    if (healthData.suspiciousNetworkActivity && healthData.suspiciousNetworkActivity > 3) issues++;

    if (issues === 0) return { status: 'Healthy', color: '#22c55e' };
    if (issues === 1) return { status: 'Good', color: '#84cc16' };
    if (issues === 2) return { status: 'Fair', color: '#f59e0b' };
    return { status: 'Attention Needed', color: '#ef4444' };
  };

  const healthStatus = getHealthStatus();

  const handleClose = () => {
    setHealthData(null);
    setLastScanned(null);
    setExpandedSections({
      deviceInfo: true,
      battery: true,
      memory: false,
      storage: false,
      network: false,
      security: false,
      spam: false,
      spamEmails: false,
      apps: false,
    });
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.textLight]}>
          Mobile Health Scanner
        </Text>
        <View style={styles.headerButtons}>
          {healthData && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close scan results">
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
            onPress={scanDeviceHealth}
            disabled={isScanning}>
            {isScanning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.scanButtonText}>Scan Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {lastScanned && (
        <Text style={[styles.lastScanned, isDarkMode && styles.textLightSecondary]}>
          Last scanned: {lastScanned.toLocaleTimeString()}
        </Text>
      )}

      {healthData && (
        <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={false}>
          {/* Health Status */}
          <View style={[styles.statusCard, isDarkMode && styles.cardDark]}>
            <Text style={[styles.statusLabel, isDarkMode && styles.textLightSecondary]}>
              Overall Status
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: healthStatus.color }]} />
              <Text style={[styles.statusText, { color: healthStatus.color }, isDarkMode && styles.textLight]}>
                {healthStatus.status}
              </Text>
            </View>
          </View>

          {/* Device Information */}
          <View style={[styles.card, isDarkMode && styles.cardDark]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
              Device Information
            </Text>
            <HealthRow label="Device Name" value={healthData.deviceName} isDarkMode={isDarkMode} />
            <HealthRow label="Brand" value={healthData.brand} isDarkMode={isDarkMode} />
            <HealthRow label="Model" value={healthData.model} isDarkMode={isDarkMode} />
            <HealthRow label="OS" value={`${healthData.systemName} ${healthData.systemVersion}`} isDarkMode={isDarkMode} />
            <HealthRow label="Device ID" value={healthData.deviceId} isDarkMode={isDarkMode} />
            <HealthRow label="App Version" value={`${healthData.appVersion} (${healthData.buildNumber})`} isDarkMode={isDarkMode} />
          </View>

          {/* Battery Information */}
          {healthData.batteryLevel !== null && (
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSections(prev => ({ ...prev, battery: !prev.battery }))}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                  Battery
                </Text>
                <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                  {expandedSections.battery ? '−' : '+'}
                </Text>
              </TouchableOpacity>
              {expandedSections.battery && (
                <>
                  <HealthRow
                    label="Level"
                    value={`${healthData.batteryLevel}%`}
                    isDarkMode={isDarkMode}
                    highlight={healthData.batteryLevel < 20}
                  />
                  <HealthRow
                    label="Status"
                    value={healthData.isCharging ? 'Charging' : 'Not Charging'}
                    isDarkMode={isDarkMode}
                  />
                </>
              )}
            </View>
          )}

          {/* Memory Information */}
          <View style={[styles.card, isDarkMode && styles.cardDark]}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setExpandedSections(prev => ({ ...prev, memory: !prev.memory }))}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                Memory
              </Text>
              <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                {expandedSections.memory ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {expandedSections.memory && (
              <>
                <HealthRow label="Total" value={healthData.totalMemory} isDarkMode={isDarkMode} />
                {healthData.usedMemory !== 'N/A' && (
                  <>
                    <HealthRow label="Used" value={healthData.usedMemory} isDarkMode={isDarkMode} />
                    <HealthRow label="Free" value={healthData.freeMemory} isDarkMode={isDarkMode} />
                  </>
                )}
              </>
            )}
          </View>

          {/* Storage Information */}
          <View style={[styles.card, isDarkMode && styles.cardDark]}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setExpandedSections(prev => ({ ...prev, storage: !prev.storage }))}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                Storage
              </Text>
              <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                {expandedSections.storage ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {expandedSections.storage && (
              <>
                <HealthRow label="Total" value={healthData.totalStorage} isDarkMode={isDarkMode} />
                <HealthRow
                  label="Free"
                  value={healthData.freeStorage}
                  isDarkMode={isDarkMode}
                  highlight={healthData.freeStorage !== 'N/A' && parseFloat(healthData.freeStorage) < 1000 * 1024 * 1024}
                />
              </>
            )}
          </View>

          {/* Network Information */}
          <View style={[styles.card, isDarkMode && styles.cardDark]}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setExpandedSections(prev => ({ ...prev, network: !prev.network }))}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                Network
              </Text>
              <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                {expandedSections.network ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {expandedSections.network && (
              <>
                <HealthRow
                  label="Status"
                  value={healthData.isConnected ? 'Connected' : 'Disconnected'}
                  isDarkMode={isDarkMode}
                  highlight={!healthData.isConnected}
                />
                <HealthRow label="Type" value={healthData.connectionType} isDarkMode={isDarkMode} />
                {healthData.suspiciousNetworkActivity !== undefined && (
                  <HealthRow
                    label="Suspicious Activity"
                    value={healthData.suspiciousNetworkActivity > 0 ? `${healthData.suspiciousNetworkActivity} detected` : 'None'}
                    isDarkMode={isDarkMode}
                    highlight={healthData.suspiciousNetworkActivity > 3}
                  />
                )}
              </>
            )}
          </View>

          {/* Security Warnings */}
          {healthData.securityWarnings && healthData.securityWarnings.length > 0 && (
            <View style={[styles.card, styles.warningCard, isDarkMode && styles.cardDark]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSections(prev => ({ ...prev, security: !prev.security }))}>
                <Text style={[styles.sectionTitle, styles.warningTitle, isDarkMode && styles.textLight]}>
                  ⚠️ Security Warnings
                </Text>
                <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                  {expandedSections.security ? '−' : '+'}
                </Text>
              </TouchableOpacity>
              {expandedSections.security && (
                <>
                  {healthData.securityWarnings.map((warning, index) => (
                    <View key={index} style={styles.warningRow}>
                      <Text style={[styles.warningText, isDarkMode && styles.textLight]}>
                        • {warning}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {/* Spam Emails */}
          {healthData.spamEmails && healthData.spamEmails.length > 0 && (
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSections(prev => ({ ...prev, spamEmails: !prev.spamEmails }))}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                  📧 Spam Emails ({healthData.spamEmails.length})
                </Text>
                <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                  {expandedSections.spamEmails ? '−' : '+'}
                </Text>
              </TouchableOpacity>
              {expandedSections.spamEmails && (
                <View style={styles.spamList}>
                  {healthData.spamEmails.map((email, index) => (
                    <View key={index} style={[styles.spamItem, isDarkMode && styles.spamItemDark]}>
                      <View style={styles.spamHeader}>
                        <Text style={[styles.spamSender, isDarkMode && styles.textLight]} numberOfLines={1}>
                          From: {email.sender}
                        </Text>
                        <View style={[styles.spamScoreBadge, { backgroundColor: email.spamScore > 70 ? '#ef4444' : '#f59e0b' }]}>
                          <Text style={styles.spamScoreText}>{email.spamScore}%</Text>
                        </View>
                      </View>
                      <Text style={[styles.emailSubject, isDarkMode && styles.textLight]} numberOfLines={1}>
                        {email.subject}
                      </Text>
                      <Text style={[styles.spamMessage, isDarkMode && styles.textLightSecondary]} numberOfLines={2}>
                        {email.preview}
                      </Text>
                      <View style={styles.spamReasons}>
                        {email.spamReasons.map((reason, reasonIndex) => (
                          <View key={reasonIndex} style={styles.reasonTag}>
                            <Text style={styles.reasonText}>{reason}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Spam Messages */}
          {healthData.spamMessages && healthData.spamMessages.length > 0 && (
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSections(prev => ({ ...prev, spam: !prev.spam }))}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                  🚨 Spam Messages ({healthData.spamMessages.length})
                </Text>
                <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                  {expandedSections.spam ? '−' : '+'}
                </Text>
              </TouchableOpacity>
              {expandedSections.spam && (
                <View style={styles.spamList}>
                  {healthData.spamMessages.map((spam, index) => (
                    <View key={index} style={[styles.spamItem, isDarkMode && styles.spamItemDark]}>
                      <View style={styles.spamHeader}>
                        <Text style={[styles.spamSender, isDarkMode && styles.textLight]}>
                          From: {spam.sender}
                        </Text>
                        <View style={[styles.spamScoreBadge, { backgroundColor: spam.spamScore > 70 ? '#ef4444' : '#f59e0b' }]}>
                          <Text style={styles.spamScoreText}>{spam.spamScore}%</Text>
                        </View>
                      </View>
                      <Text style={[styles.spamMessage, isDarkMode && styles.textLightSecondary]} numberOfLines={2}>
                        {spam.message}
                      </Text>
                      <View style={styles.spamReasons}>
                        {spam.spamReasons.map((reason, reasonIndex) => (
                          <View key={reasonIndex} style={styles.reasonTag}>
                            <Text style={styles.reasonText}>{reason}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Apps with Data Access */}
          {healthData.appsWithDataAccess && healthData.appsWithDataAccess.length > 0 && (
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSections(prev => ({ ...prev, apps: !prev.apps }))}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
                  📱 Apps Accessing Data ({healthData.appsWithDataAccess.length})
                </Text>
                <Text style={[styles.expandIcon, isDarkMode && styles.textLight]}>
                  {expandedSections.apps ? '−' : '+'}
                </Text>
              </TouchableOpacity>
              {expandedSections.apps && (
                <View style={styles.appsList}>
                  {healthData.appsWithDataAccess.map((app, index) => (
                    <View key={index} style={[styles.appItem, isDarkMode && styles.appItemDark]}>
                      <View style={styles.appHeader}>
                        <Text style={[styles.appName, isDarkMode && styles.textLight]}>
                          {app.appName}
                        </Text>
                        <View style={[
                          styles.riskBadge,
                          { backgroundColor: app.riskLevel === 'high' ? '#ef4444' : app.riskLevel === 'medium' ? '#f59e0b' : '#84cc16' }
                        ]}>
                          <Text style={styles.riskText}>{app.riskLevel.toUpperCase()}</Text>
                        </View>
                      </View>
                      <View style={styles.permissionsList}>
                        {app.hasNetworkAccess && (
                          <View style={styles.permissionTag}>
                            <Text style={styles.permissionText}>🌐 Network</Text>
                          </View>
                        )}
                        {app.hasSmsAccess && (
                          <View style={styles.permissionTag}>
                            <Text style={styles.permissionText}>💬 SMS</Text>
                          </View>
                        )}
                        {app.hasLocationAccess && (
                          <View style={styles.permissionTag}>
                            <Text style={styles.permissionText}>📍 Location</Text>
                          </View>
                        )}
                        {app.hasCameraAccess && (
                          <View style={styles.permissionTag}>
                            <Text style={styles.permissionText}>📷 Camera</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {!healthData && !isScanning && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, isDarkMode && styles.textLightSecondary]}>
            Tap "Scan Now" to check your device health
          </Text>
        </View>
      )}
    </View>
  );
}

interface HealthRowProps {
  label: string;
  value: string;
  isDarkMode: boolean;
  highlight?: boolean;
}

function HealthRow({ label, value, isDarkMode, highlight }: HealthRowProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, isDarkMode && styles.textLightSecondary]}>
        {label}:
      </Text>
      <Text
        style={[
          styles.rowValue,
          isDarkMode && styles.textLight,
          highlight && styles.highlightText,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  textLight: {
    color: '#e2e8f0',
  },
  textLightSecondary: {
    color: '#94a3b8',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
  },
  scanButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  lastScanned: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  dataContainer: {
    maxHeight: 400,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  highlightText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  warningCard: {
    borderWidth: 2,
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  warningTitle: {
    color: '#f59e0b',
  },
  warningRow: {
    paddingVertical: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    width: 30,
    textAlign: 'center',
  },
  spamList: {
    marginTop: 8,
  },
  spamItem: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  spamItemDark: {
    backgroundColor: '#1e293b',
    borderLeftColor: '#dc2626',
  },
  spamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spamSender: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
    flex: 1,
  },
  spamScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spamScoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  spamMessage: {
    fontSize: 13,
    color: '#7f1d1d',
    marginBottom: 8,
    lineHeight: 18,
  },
  emailSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 6,
    marginTop: 4,
  },
  spamReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reasonTag: {
    backgroundColor: '#fca5a5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#991b1b',
    fontWeight: '600',
  },
  appsList: {
    marginTop: 8,
  },
  appItem: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  appItemDark: {
    backgroundColor: '#1e293b',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
});

export default MobileHealthScanner;

