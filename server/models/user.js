module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is empty!',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Last name is empty!',
        },
      },
    },
    sex: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['male', 'female']],
          msg: 'Sex must be male or female!',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Phone is already exist!',
      },
      validate: {
        notEmpty: {
          msg: 'Phone is empty!',
        },
        isNumeric: {
          msg: 'Phone must be numeric!',
        },
        len: {
          args: [10],
          msg: 'Phone must contain at least ten numbers!',
        },
      },
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Login is already exist!',
      },
      validate: {
        notEmpty: {
          msg: 'Login is empty!',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email is already exist!',
      },
      validate: {
        notEmpty: {
          msg: 'Email is empty!',
        },
        isEmail: {
          msg: 'Email is incorrect!',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is empty!',
        },
        len: {
          args: [6],
          msg: 'Password must contain at least six symbols!',
        },
      },
    },
    image: DataTypes.STRING,
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifyEmailToken: {
      type: DataTypes.STRING,
    },
    verifyEmailTokenExpires: {
      type: DataTypes.DATE,
    },
    status: DataTypes.STRING,
    lastSeenAt: DataTypes.DATE,
  }, {
    getterMethods: {
      fullName() {
        return this.lastName ?
          `${this.firstName} ${this.lastName}` : this.firstName;
      },
    },

    setterMethods: {
      fullName(value) {
        const names = value.split(' ');

        this.setDataValue('firstName', names.slice(0, -1).join(' '));
        this.setDataValue('lastName', names.slice(-1).join(' '));
      },
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Message, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      as: 'messages',
    });

    User.belongsToMany(models.Dialog, {
      through: 'UserDialog',
      foreignKey: 'userId',
      as: 'dialogs',
    });
  };

  return User;
};
