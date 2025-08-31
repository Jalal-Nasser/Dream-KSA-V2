import React from 'react';
import { View, Text, ScrollView } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error?: Error; info?: { componentStack: string } };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};
  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error, info);
    this.setState({ error, info });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#111' }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
          ⚠️ Render error
        </Text>
        <Text style={{ color: '#ffb3b3', marginBottom: 12 }}>{String(this.state.error?.message || this.state.error)}</Text>
        <Text style={{ color: '#9ae6b4', fontWeight: '600', marginBottom: 6 }}>Component stack:</Text>
        <Text style={{ color: '#9ae6b4', opacity: 0.9 }}>
          {this.state.info?.componentStack || '(no stack)'}
        </Text>
      </ScrollView>
    );
  }
}
