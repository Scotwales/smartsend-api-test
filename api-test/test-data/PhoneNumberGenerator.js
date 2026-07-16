class PhoneNumberGenerator {
  static COUNTRY_PHONE_CODE_MAP = {
    Canada: '+1',
    'United States': '+1',
    France: '+33',
    Italy: '+39',
    'United Kingdom': '+44',
    'Nigeria': '+234'
  };

  static NIGERIAN_PREFIXES = ['80', '90', '70', '81', '91', '71'];

  static RANDOM_COUNTRY_CODES = Object.values(this.COUNTRY_PHONE_CODE_MAP);

  static generateRandomPhoneNumber() {
    const country = this.RANDOM_COUNTRY_CODES[Math.floor(Math.random() * this.RANDOM_COUNTRY_CODES.length)];
    return this.generatePhoneNumber(country);
  }

  static generatePhoneNumber(countryNameOrCode) {
    const countryCode = this.getCountryPhoneCode(countryNameOrCode);
    let number = '';
    if (countryCode === '+234') {
      const prefix = this.NIGERIAN_PREFIXES[Math.floor(Math.random() * this.NIGERIAN_PREFIXES.length)];
      number = prefix;
      for (let i = 0; i < 8; i++) {
        number += Math.floor(Math.random() * 10);
      }
    } else {
      for (let i = 0; i < 9; i++) {
        number += Math.floor(Math.random() * 10);
      }
    }
    return `${countryCode}${number}`;
  }

  static generateNigerianPhoneNumber() {
    return this.generatePhoneNumber('Nigeria');
  }

  static getCountryPhoneCode(countryNameOrCode) {
    if (!countryNameOrCode) {
      return this.RANDOM_COUNTRY_CODES[0];
    }

    if (typeof countryNameOrCode === 'string' && countryNameOrCode.startsWith('+')) {
      return countryNameOrCode;
    }

    const normalized = String(countryNameOrCode).trim().toLowerCase();
    const entry = Object.entries(this.COUNTRY_PHONE_CODE_MAP).find(
      ([name]) => name.toLowerCase() === normalized
    );
    return entry ? entry[1] : this.RANDOM_COUNTRY_CODES[0];
  }
}

module.exports = PhoneNumberGenerator;