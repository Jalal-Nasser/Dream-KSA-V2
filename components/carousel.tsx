import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Pressable, Text } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;

const Carousel = ({ children, ...props }) => {
  const scrollViewRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const scrollLeft = () => {
    if (currentIndex > 0) {
      scrollViewRef.current.scrollTo({
        x: (currentIndex - 1) * ITEM_WIDTH,
        animated: true,
      });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    if (currentIndex < React.Children.count(children) - 1) {
      scrollViewRef.current.scrollTo({
        x: (currentIndex + 1) * ITEM_WIDTH,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <View style={styles.container} {...props}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onScroll={(event) => {
          const newIndex = Math.floor(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}
      >
        {React.Children.map(children, (child) => (
          <View style={styles.itemContainer}>
            {child}
          </View>
        ))}
      </ScrollView>
      <View style={styles.controls}>
        <Pressable onPress={scrollRight} style={styles.controlButton}>
          <ChevronRight size={24} color="#e5e7eb" />
        </Pressable>
        <View style={styles.dots}>
          {React.Children.map(children, (_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
        <Pressable onPress={scrollLeft} style={styles.controlButton}>
          <ChevronLeft size={24} color="#e5e7eb" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add any container styles here
  },
  scrollViewContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  controlButton: {
    padding: 8,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4b5563',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#e5e7eb',
  },
});

export default Carousel;