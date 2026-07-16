class EmailGenerator {
  static getRandomFirstName() {
    const names = [
      "James", "John", "Mary", "Grace", "David", "Sarah",
      "Daniel", "Linda", "Paul", "Ruth", "Seyi", "Emmanuel",
      "Rachel", "Michael", "Joy", "Peter", "Hannah", "Timothy" , "Nancy", "Roger"
    ];

    const name = names[Math.floor(Math.random() * names.length)];
    return name.replace(/[^a-zA-Z]/g, "");
  }

  static getRandomLastName() {
    const names = [
      "Idowu", "Adeyemi", "Johnson", "Olaoye", "Adewale",
      "Brown", "Ogunleye", "Williams", "Okafor", "Balogun",
      "Smith", "James", "Ojo", "Thomas" , "Mccal", "Shady",
      "Johnson", "Brown", "Smith", "Williams", "Jones",
      "Brown", "Davis", "Garcia", "Miller", "Wilson", "Moore", "Taylor"
    ];

    const name = names[Math.floor(Math.random() * names.length)];
    return name.replace(/[^a-zA-Z]/g, "");
  }

  static getRandomEmail(baseName) {
    const clean = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const random = Math.floor(Math.random() * 90000) + 10000; // 5-digit random
    return `${clean}${random}@yopmail.com`;
  }
}

module.exports = EmailGenerator;
