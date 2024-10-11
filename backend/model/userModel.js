const sequelize = require("../config/databaseConfig");
const { DataTypes } = require("sequelize");

// User 모델 정의
const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // 타임스탬프 컬럼을 사용하지 않도록 설정
    sequelize,
    modelName: "user",
    tableName: "user", // 테이블명을 명시적으로 설정
  }
);
module.exports = { User };
