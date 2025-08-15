import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  title: string;
  date: string;
  organizer_id: string;
  organizer_name?: string;
  activity_type: string;
  location: string;
}

interface ReviewPromptProps {
  pastActivities: Activity[];
  onReviewSubmitted: () => void;
}

export const ReviewPrompt: React.FC<ReviewPromptProps> = ({ 
  pastActivities, 
  onReviewSubmitted 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedActivities, setReviewedActivities] = useState<Set<string>>(new Set());
  const [pendingReviewActivities, setPendingReviewActivities] = useState<Activity[]>([]);

  useEffect(() => {
    checkForPendingReviews();
  }, [pastActivities, user]);

  const checkForPendingReviews = async () => {
    if (!user || pastActivities.length === 0) return;

    try {
      // Get activities that need reviews (past activities where user participated but hasn't reviewed)
      const activitiesNeedingReview = [];
      
      for (const activity of pastActivities) {
        // Check if activity is past due (more than 1 day after activity date)
        const activityDate = new Date(activity.date);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysPassed >= 1) {
          // Check if user already reviewed this activity
          const response = await apiService.getActivityReviews(activity.id);
          const existingReview = response.data?.find(
            (review: any) => review.reviewer_id === user.id
          );
          
          if (!existingReview) {
            activitiesNeedingReview.push(activity);
          }
        }
      }

      setPendingReviewActivities(activitiesNeedingReview);
      
      // Show prompt if there are activities to review
      if (activitiesNeedingReview.length > 0) {
        setCurrentActivityIndex(0);
        setShowPrompt(true);
      }
    } catch (error) {
      console.error('Error checking for pending reviews:', error);
    }
  };

  const currentActivity = pendingReviewActivities[currentActivityIndex];

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmitReview = async () => {
    if (!currentActivity || !user || rating === 0) return;

    setIsSubmitting(true);
    try {
      const reviewData = {
        activity_id: currentActivity.id,
        reviewee_id: currentActivity.organizer_id, // Review the organizer
        rating,
        comment: comment.trim() || undefined,
      };

      const response = await apiService.createActivityReview(reviewData);
      
      if (response.data) {
        toast({
          title: "Review Submitted! ⭐",
          description: `Thank you for reviewing "${currentActivity.title}"`,
        });

        setReviewedActivities(prev => new Set([...prev, currentActivity.id]));
        onReviewSubmitted();
        
        // Move to next activity or close
        const nextIndex = currentActivityIndex + 1;
        if (nextIndex < pendingReviewActivities.length) {
          setCurrentActivityIndex(nextIndex);
          setRating(0);
          setComment('');
        } else {
          handleClosePrompt();
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error Submitting Review",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipReview = () => {
    const nextIndex = currentActivityIndex + 1;
    if (nextIndex < pendingReviewActivities.length) {
      setCurrentActivityIndex(nextIndex);
      setRating(0);
      setComment('');
    } else {
      handleClosePrompt();
    }
  };

  const handleClosePrompt = () => {
    setShowPrompt(false);
    setRating(0);
    setComment('');
    setCurrentActivityIndex(0);
  };

  if (!currentActivity) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSportEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      cycling: "🚴",
      climbing: "🧗",
      running: "👟",
      hiking: "🥾",
      skiing: "⛷️",
      surfing: "🌊",
      tennis: "🎾",
    };
    return emojis[type] || "⚡";
  };

  return (
    <Dialog open={showPrompt} onOpenChange={handleClosePrompt}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getSportEmoji(currentActivity.activity_type)}
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            How was "{currentActivity.title}" on {formatDate(currentActivity.date)}?
            <br />
            <span className="text-xs text-gray-500 mt-1 block">
              Activity {currentActivityIndex + 1} of {pendingReviewActivities.length}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium mb-3">Rate the organizer & activity:</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="transition-colors"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium">
              Share your experience (optional):
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you enjoy? Any suggestions for improvement?"
              rows={3}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          {/* Activity Details */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>Organizer:</strong> {currentActivity.organizer_name || 'Unknown'}</p>
            <p><strong>Location:</strong> {currentActivity.location}</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSkipReview}
            disabled={isSubmitting}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmitReview}
            disabled={rating === 0 || isSubmitting}
            className="bg-explore-green hover:bg-green-600"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPrompt;
