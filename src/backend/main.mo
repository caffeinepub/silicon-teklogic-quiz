import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    registrationNumber : ?Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  module Question {
    public func compareByRound(question1 : Question, question2 : Question) : Order.Order {
      Nat.compare(question1.round, question2.round);
    };
  };

  module Submission {
    public func compareByScore(submission1 : Submission, submission2 : Submission) : Order.Order {
      Int.compare(submission2.score, submission1.score);
    };
  };

  type QuestionType = {
    #mcq;
    #shortAnswer;
  };

  type Question = {
    id : Nat;
    text : Text;
    questionType : QuestionType;
    options : ?[Text];
    correctAnswer : Text;
    round : Nat;
    subject : Text;
  };

  type Participant = {
    name : Text;
    registrationNumber : Text;
    email : Text;
    college : Text;
    registeredAt : Int;
  };

  type Answer = {
    questionId : Nat;
    answer : Text;
  };

  type Submission = {
    participant : Participant;
    answers : [Answer];
    score : Int;
    submittedAt : Int;
  };

  let questions = Map.empty<Nat, Question>();
  let participants = Map.empty<Text, Participant>();
  let submissions = Map.empty<Text, Submission>();
  var whitelistedEmails = List.empty<Text>();
  var systemInitialized = false;

  func ensureInitialized() {
    if (not systemInitialized) {
      Runtime.trap("System not initialized");
    };
  };

  public shared ({ caller }) func initializeSystem() : async () {
    if (systemInitialized) {
      Runtime.trap("Already initialized. Please call initialize to initialize your own app.");
    };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    systemInitialized := true;
  };

  public shared ({ caller }) func addWhitelistedEmail(email : Text) : async () {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    whitelistedEmails.add(email);
  };

  public shared ({ caller }) func removeWhitelistedEmail(email : Text) : async () {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    whitelistedEmails := whitelistedEmails.filter<Text>(func(e) { e != email });
  };

  public query ({ caller }) func isEmailWhitelisted(email : Text) : async Bool {
    ensureInitialized();
    whitelistedEmails.contains(email);
  };

  public query ({ caller }) func getAllWhitelistedEmails() : async [Text] {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    whitelistedEmails.toArray();
  };

  public shared ({ caller }) func addQuestion(question : Question) : async () {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    questions.add(question.id, question);
  };

  public shared ({ caller }) func updateQuestion(id : Nat, updatedQuestion : Question) : async () {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not questions.containsKey(id)) {
      Runtime.trap("Question not found");
    };
    questions.add(id, updatedQuestion);
  };

  public shared ({ caller }) func deleteQuestion(id : Nat) : async () {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not questions.containsKey(id)) {
      Runtime.trap("Question not found");
    };
    questions.remove(id);
  };

  public query ({ caller }) func getAllQuestions() : async [Question] {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray();
  };

  public query ({ caller }) func getQuestionsByRound(round : Nat) : async [Question] {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    let allQuestions = questions.values().toArray();
    let filteredQuestions = allQuestions.filter(
      func(q) { q.round == round }
    );
    filteredQuestions.sort<Question>(
      Question.compareByRound
    );
  };

  public query ({ caller }) func getQuestionsBySubject(subject : Text) : async [Question] {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    let allQuestions = questions.values().toArray();
    allQuestions.filter<Question>(
      func(q) { Text.equal(q.subject, subject) }
    );
  };

  public shared ({ caller }) func registerParticipant(participant : Participant) : async () {
    ensureInitialized();
    if (not whitelistedEmails.contains(participant.email)) {
      Runtime.trap("Email not whitelisted");
    };
    if (participants.containsKey(participant.registrationNumber)) {
      Runtime.trap("Registration number already exists");
    };
    participants.add(participant.registrationNumber, participant);
  };

  public query ({ caller }) func getParticipant(registrationNumber : Text) : async Participant {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view participant details");
    };
    switch (participants.get(registrationNumber)) {
      case (null) { Runtime.trap("Participant not found") };
      case (?participant) { participant };
    };
  };

  public query ({ caller }) func getAllParticipants() : async [Participant] {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    participants.values().toArray();
  };

  public shared ({ caller }) func submitQuiz(
    registrationNumber : Text,
    answers : [Answer],
    score : Int,
  ) : async () {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz");
    };
    let participant = switch (participants.get(registrationNumber)) {
      case (null) { Runtime.trap("Participant not found") };
      case (?p) { p };
    };
    let submission : Submission = {
      participant;
      answers;
      score;
      submittedAt = Time.now();
    };
    submissions.add(registrationNumber, submission);
  };

  public query ({ caller }) func getLeaderboard() : async [Submission] {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leaderboard");
    };
    let allSubmissions = submissions.values().toArray();
    allSubmissions.sort<Submission>(
      Submission.compareByScore
    );
  };

  public query ({ caller }) func getParticipantResults(registrationNumber : Text) : async Submission {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view results");
    };
    switch (submissions.get(registrationNumber)) {
      case (null) { Runtime.trap("No submission found for participant") };
      case (?submission) { submission };
    };
  };

  public query ({ caller }) func getExportData() : async [(Text, Text, Text, Text, Int, Int)] {
    ensureInitialized();
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let submissionsArray = submissions.entries().toArray();
    submissionsArray.map<(Text, Submission), (Text, Text, Text, Text, Int, Int)>(
      func((_, submission)) {
        let p = submission.participant;
        (p.name, p.registrationNumber, p.email, p.college, submission.score, submission.submittedAt);
      }
    );
  };

  public query ({ caller }) func getQuizResultsDetailed(registrationNumber : Text) : async {
    answers : [Answer];
    questions : [Question];
    score : Int;
  } {
    ensureInitialized();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view detailed results");
    };
    switch (submissions.get(registrationNumber)) {
      case (null) { Runtime.trap("No submission found for participant") };
      case (?submission) {
        let answeredQuestions = submission.answers.map(
          func(answer) {
            switch (questions.get(answer.questionId)) {
              case (?question) { question };
              case (null) {
                Runtime.trap("Question not found for id: " # answer.questionId.toText());
              };
            };
          }
        );
        {
          answers = submission.answers;
          questions = answeredQuestions;
          score = submission.score;
        };
      };
    };
  };

  // Authorization Initialization Fix
  public shared ({ caller }) func initializeAccessControlWithSecret(isAdminPassword : Text) : async () {
    if (isAdminPassword == "admin123") {
      AccessControl.initialize(accessControlState, caller, "admin123", "admin123");
    } else {
      Runtime.trap("Unauthorized: Invalid admin password");
    };
  };
};
