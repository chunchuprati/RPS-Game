$( document ).ready(function() {
	 // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAXaw0Nw6n8n1CEWE7JWKNdxJDxqkZNU34",
    authDomain: "rps-game-fb925.firebaseapp.com",
    databaseURL: "https://rps-game-fb925.firebaseio.com",
    projectId: "rps-game-fb925",
    storageBucket: "rps-game-fb925.appspot.com",
    messagingSenderId: "387009510305"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  var player = {
  	name:"",
  	wins:0,
  	losses:0,
  	ties:0,
  	selectedChoice:""
  };

  var opponent = {
  	name:"",
  	wins:0,
  	losses:0,
  	ties:0,
  	selectedChoice:""
  };

 database.ref('Player').on("value", function(snapshot){
  if(snapshot.exists()){
    player = snapshot.val();
    $("#title1").html(snapshot.val().name);
  } else{
    $("#player1 #button_div").empty();
    $("#title1").html("Waiting for Player1");
    player.name = ""; //Resetting the name attribute of player variable to blank    
  }
 });

 database.ref('Opponent').on("value", function(snapshot){
  if(snapshot.exists()) {
    opponent = snapshot.val();
    $("#title2").html(snapshot.val().name);
  } else{
    $("#player2 #button_div").empty();
    $("#title2").html("Waiting for Player2");
    opponent.name = ""; //Resetting the name attribute of opponent variable to blank
  }
 });

 $("#reset-button").on("click", function(event){
  event.preventDefault();

  database.ref().remove();
  $("#player-name").val('');
  $("#comment").val('');
  renderDefaultUI();
 });

 /*
 * Event handler for capturing the player name
 */
 $("#start-button").on("click", function(event){
	event.preventDefault();

	var playerName = $("#player-name").val().trim();
  if(playerName.length > 0) { //length property to check if the user has given the name in the textbox
    if(player.name.length > 0){ //length property to check if user has already defined the "Player"
      if (player.name.toLowerCase() !== playerName.toLowerCase()) { //Check if the "Player" and "Opponent" are same
        opponent.name = playerName;
        setScore(opponent, "Opponent");
        setOptions("opponent");
        $("#player-name").val('');
        $("#start-button").prop('disabled', true);
      } else {
        alert("Please choose different name for opponent");
      }
    }
    else{
      player.name = playerName;
      setScore(player, "Player");
      setOptions("player");
      $("#player-name").val('');
    }
  } else {
    alert("Provide the name of the player")
  }
 });

 /*
 * Event handler for capturing the comments and subsequently to display in the "Comments" box
 */
 $("#send-button").on("click", function(event){
  var msgText = $("#sendtext").val();
  database.ref("Chatroom").push({
    message:msgText 
  });
 });

 database.ref("Chatroom").on('child_added', function(snapshot){
  //alert(snapshot.val().message);
  $("#comment").append(snapshot.val().message+"\n");
 });


 /*
 * This function displays the options to choose for individual players
 * The choices are displayed as buttons
 * Selected option is stored in the firebase db against the individual player
 * When the opponent makes a choice, we perform the check to choose the winner 
 */
 function setOptions(playerType){
  var html = "<div id='button_div'><button class='btn-primary' id='paper'>"+
              "<img src='assets/images/paper.png'"+
              " class='images'></button>" + 
              "<button class='btn-primary' id='rock'>"+
              "<img src='assets/images/rock.png'"+
              " class='images'></button>" + 
              "<button class='btn-primary' id='scissors'>"+
              "<img src='assets/images/scissors.png'"+
              " class='images'></button></div>";
  if(playerType === "player"){
    $("#player1").append(html);
  } 
  else {
    $("#player2 #button_div").empty();
    $("#player2").append(html);
  }
  $("button.btn-primary").on("click", function(){
    var selectedChoice = $(this).attr('id').trim();
    //alert(selectedChoice);
    var parentTagID = $(this).parent().parent().get(0).id;
    //alert(parentTagID);
    if(parentTagID === 'player1'){
      player.selectedChoice = selectedChoice;
      setScore(player, "Player");
      checkWinner();
    } else if(parentTagID === 'player2'){
      opponent.selectedChoice = selectedChoice;
      setScore(opponent, "Opponent");
      checkWinner(); 
    }
  });
 };

  /*
  * This function updates the data in firebase db
  */
  function setScore(lclPlayer, playerType){
    database.ref(playerType).set(lclPlayer);      
  };

  /*
  * This function is called to display the score for individual player after the results are checked
  * This function empties the div holding the player information and resets with the current score
  */
  function displayScore(){
   //Setting the score for Player
   playerRef = database.ref("Player");
   playerRef.once("value", function(snapshot){
    player = snapshot.val();
   });
   $("#player1").empty(); 
   $("#player1").append("<h2 id='title1'>"+player.name+"</h2>");
   setOptions("player");
   var html = "<div id='results_div'><ul><li>"+
              "wins: "+player.wins+
              "</li><li>"+
              "losses: "+player.losses+  
              "</li><li>"+
              "ties: "+player.ties+
              "</li></ul></div>";
    $("#player1").append(html);

    //Setting the score for Opponent
   opponentRef = database.ref("Opponent");
   opponentRef.once("value", function(snapshot){
    opponent = snapshot.val();
   });
   $("#player2").empty(); 
   $("#player2").append("<h2 id='title2'>"+opponent.name+"</h2>");
   setOptions("opponent");
   var html = "<div id='results_div'><ul><li>"+
              "wins: "+opponent.wins+
              "</li><li>"+
              "losses: "+opponent.losses+  
              "</li><li>"+
              "ties: "+opponent.ties+
              "</li></ul></div>";
    $("#player2").append(html);
  };

  /*
  Function below takes the selected options from each player and compares to check the winner
  Logic for checking the winner is regular rules of childrens game
  Function also displays who is the winner or if it's a tie and displays the result in "Result" div
  */
  function checkWinner(){
    var playerChosenOption = player.selectedChoice; //Choice selected by the player
    var opponentChosenOption = opponent.selectedChoice; //Choice selected by the opponent
    
    var html = "<div id='game_result_div'>";
    
    if((playerChosenOption.length > 0 ) && (opponentChosenOption.length > 0)){
      if((playerChosenOption === "rock") && (opponentChosenOption === "scissors")){
        player.wins++;
        opponent.losses++;
        html += player.name+" wins!!!";
      } else if ((playerChosenOption === "scissors") && (opponentChosenOption === "paper")){
        player.wins++; 
        opponent.losses++;
        html += player.name+" wins!!!";
      } else if ((playerChosenOption === "paper") && (opponentChosenOption === "rock")){
        player.wins++; 
        opponent.losses++;
        html += player.name+" wins!!!";
      } else if (playerChosenOption === opponentChosenOption) {
        player.ties++;
        opponent.ties++;
        html += "We have a tie!!!";
      } else {
        opponent.wins++;
        player.losses++;
        html += opponent.name + " wins!!!";
      }
      html += "</div>";
      
      renderResult(html);
      
      //Resetting the selectedChoice property to blank for the new turn
      player.selectedChoice = "";
      opponent.selectedChoice = "";

      setScore(player, "Player"); //sets the parameters for the player and updates firebase database
      setScore(opponent, "Opponent"); //sets the parameters for the opponent and updates firebase database
        
      displayScore();
    }
  };

  /*
  * function to render the "Results" section of the game
  * for every checkWinner, we will empty the div and recreate with the result
  * this is to make sure we don't keep appending the result but to only show the latest result
  */
  function renderResult(html){
    $("#results").empty(); 
    $("#results").append("<h2 id='title'>Results</h2>");
    $("#results").append(html);
  };

  /*
  * this function will render the UI to it's default state
  * this function will reset all the variables to their original state
  * function will be called when we "Reset" the game 
  */
  function renderDefaultUI(){
    $("#player1").empty();
    $("#player1").append("<h2 id='title1'>Waiting for Player1</h2>");
    $("#results").empty();
    $("#results").append("<h2 id='title'>Results</h2>");
    $("#player2").empty();
    $("#player2").append("<h2 id='title2'>Waiting for Player2</h2>");
    $("#start-button").prop('disabled', false);
  };
});
