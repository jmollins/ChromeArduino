/*
  Read Arduino Temperature
  
  Read and report the temperature from an LM35 when data
  is received from the host computer.
  
 */

// Setup communications
void setup() {
  // 9600 bps
  Serial.begin(9600);
}

// wait to receive signal from host 
// then report temperature

void loop() {
  // wait for request from host compuiter
  if (Serial.available() > 0) {
    while (Serial.available() > 0){
      char temp = Serial.read(); //empty the buffer
      
      delay(1);
     }
    //read the voltage on pin A0 and convert to temperature in C
      String temperature = String((float)analogRead(A0)/1024*500, 1); //reading from lm35
    //Send temperature value <  >
      String send = "<" + temperature + ">";
      Serial.println(send);
  }
  delay(1);  // delay between reads}

}
